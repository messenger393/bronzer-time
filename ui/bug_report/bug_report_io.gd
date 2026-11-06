extends RefCounted
class_name BugReportIO

# Bug-report capture for Nisaba's panel. No upload. Files stay on disk.
# Never writes under C:/BnB/Play, C:/BnB/Downloads, res://, or beside an
# exported playable executable. Windows with C:/BnB/Work present:
#   C:/BnB/Work/bug-reports/<timestamp>/
# Otherwise (Linux, dev, or Work missing):
#   user://bug-reports/<timestamp>/
# The Dictionary returned by write_report includes that folder as an absolute path.
#
# static func destination_root() -> String
# static func make_report_dir() -> String
# static func write_report(dest_dir: String, payload: Dictionary) -> Dictionary
#     # payload: seen: String, doing: String, screenshot: Image (or null),
#     #          include_recording: bool
#     # returns {ok: bool, path: String, error: String}
# static func build_tip() -> String
# static func game_clock() -> Dictionary   # {day, time_label, is_night}
# static func camera_spot() -> Dictionary  # {x, y, zoom}
# static func start_screen_record() -> Dictionary  # {ok: bool, error: String}
# static func stop_screen_record(dest_dir: String) -> Dictionary  # {ok, path, error}
# static func is_recording() -> bool
#
# Screen record is on demand only. Gilgamesh's recorder is ClipRec
# (gilgamesh/engine @ 4baa26a), res://core/clip_rec.gd:
#   var clip := preload("res://core/clip_rec.gd").new()
#   tree.root.add_child(clip)   # keep this node
#   clip.start() -> {ok, err}
#   clip.stop_and_write(dir) -> {ok, path, frames, seconds, err}  # clip.json + JPEG frames
#   clip.is_recording() -> bool
#   clip.elapsed_s() -> float
# preload() would stop this file parsing on a branch that does not have ClipRec yet,
# so the same path is load()ed the first time recording starts. This module does not
# encode frames. clip.json and clip_####.jpg are written only by ClipRec.stop_and_write.
# start_screen_record hides the bug-report panel and unpauses, then calls start().
# stop_screen_record and write_report (submit) call stop_and_write into the report
# folder even when is_recording() is already false after the 30s cap, then show the panel.

const CLIP_REC_PATH := "res://core/clip_rec.gd"
const WORK_REPORTS := "C:/BnB/Work/bug-reports"
const FALLBACK_REPORTS := "user://bug-reports"
const LOG_TAIL := 512 * 1024
const SAVE_AUTO_MAX := 256 * 1024 * 1024

static var _clip: Node = null
static var _hidden_panel: CanvasItem = null
static var _paused_before := false
static var _pause_touched := false
static var _spd_owner: Object = null
static var _spd_restore = null

static func destination_root() -> String:
	return _destination_root(_work_exists())

static func make_report_dir() -> String:
	var root := destination_root()
	if root.is_empty() or _is_forbidden(root):
		return ""
	var stamp := _timestamp()
	var path := root.path_join(stamp)
	var n := 2
	while _dir_exists(path):
		path = root.path_join("%s-%02d" % [stamp, n])
		n += 1
		if n > 100:
			return ""
	if _is_forbidden(path):
		return ""
	if _mkdir(path) != OK:
		return ""
	return path

static func write_report(dest_dir: String, payload: Dictionary) -> Dictionary:
	if dest_dir.is_empty() or _is_forbidden(dest_dir) or not _under_reports(dest_dir):
		return _result(false, "", "Refusing to write a bug report outside the bug-report folder (Play, Downloads, and the playable directory are never used).")
	if _mkdir(dest_dir) != OK:
		return _result(false, "", "Could not create the bug-report folder.")
	# Submit flushes a capped clip too: frames stay in memory after is_recording() goes false.
	var flushed := false
	if _clip != null and is_instance_valid(_clip):
		_flush_clip_into(dest_dir)
		flushed = true
	var fatal: PackedStringArray = PackedStringArray()
	var seen := str(payload.get("seen", ""))
	var doing := str(payload.get("doing", ""))
	var desc := "What I saw\n----------\n%s\n\nWhat I was doing\n----------------\n%s\n" % [seen, doing]
	if _write_text(dest_dir.path_join("description.txt"), desc) != OK:
		fatal.append("Could not write description.txt.")

	var shot = payload.get("screenshot", null)
	var shot_note := "not provided"
	if shot is Image:
		var png := _abs(dest_dir).path_join("screenshot.png")
		var serr: Error = (shot as Image).save_png(png)
		if serr != OK:
			fatal.append("Could not write screenshot.png (%s)." % error_string(serr))
			shot_note = "write failed"
		else:
			shot_note = "screenshot.png"

	var save_info := _copy_save(dest_dir)
	if bool(save_info.get("failed", false)):
		fatal.append(str(save_info.get("error", "Could not copy the save.")))

	var log_info := _copy_logs(dest_dir)
	var clock := game_clock()
	var cam := camera_spot()
	var used := _abs(dest_dir)
	var recording := "not requested"
	if flushed or bool(payload.get("include_recording", false)):
		recording = _recording_already_in(dest_dir)

	var meta := {
		"build_tip": build_tip(),
		"clock": clock,
		"camera": cam,
		"speed": _game_speed(),
		"godot": Engine.get_version_info(),
		"os": "%s %s" % [OS.get_name(), OS.get_version()],
		"timestamp": Time.get_datetime_string_from_system(true),
		"destination_root": destination_root(),
		"path": used,
		"screenshot": shot_note,
		"save": save_info,
		"logs": log_info,
		"recording": recording,
		"clip_rec": CLIP_REC_PATH if ResourceLoader.exists(CLIP_REC_PATH) else "",
	}
	var json_text := JSON.stringify(meta, "\t")
	if json_text == "":
		fatal.append("Could not encode meta.json.")
	elif _write_text(dest_dir.path_join("meta.json"), json_text + "\n") != OK:
		fatal.append("Could not write meta.json.")
	if _write_text(dest_dir.path_join("meta.txt"), _meta_text(meta)) != OK:
		fatal.append("Could not write meta.txt.")

	var err := " ".join(fatal)
	_show_panel_again()
	return _result(fatal.is_empty(), used, err)

static func build_tip() -> String:
	var game := _autoload("Game")
	if game != null:
		for key in ["BUILD_TIP", "GIT_TIP", "COMMIT", "BUILD", "TIP"]:
			var v = _const_value(game, key)
			if v != null and str(v).strip_edges() != "":
				return str(v).strip_edges()
		for method_name in ["build_tip", "git_tip", "commit_hash"]:
			if _argc0(game, method_name):
				var called = game.call(method_name)
				if called != null and str(called).strip_edges() != "":
					return str(called).strip_edges()
	for path in ["res://build_tip.txt", "res://build.txt", "res://version.txt", "res://commit.txt", "res://BUILD_TIP"]:
		if FileAccess.file_exists(path):
			var line := FileAccess.get_file_as_string(path).strip_edges()
			if line != "":
				return line.split("\n")[0].strip_edges()
	if FileAccess.file_exists("res://build_info.json"):
		var parsed = JSON.parse_string(FileAccess.get_file_as_string("res://build_info.json"))
		if parsed is Dictionary:
			for key in ["tip", "commit", "hash", "build", "build_tip"]:
				if parsed.has(key) and str(parsed[key]).strip_edges() != "":
					return str(parsed[key]).strip_edges()
	var env := OS.get_environment("BNB_BUILD_TIP").strip_edges()
	if env != "":
		return env
	var ver := str(ProjectSettings.get_setting("application/config/version", "")).strip_edges()
	if ver != "":
		return ver
	return "unknown"

static func game_clock() -> Dictionary:
	var out := {"day": 0, "time_label": "unavailable", "is_night": false}
	var game := _autoload("Game")
	if game == null:
		return out
	if _argc0(game, "bug_report_clock"):
		var custom = game.call("bug_report_clock")
		if custom is Dictionary and custom.has("day") and custom.has("time_label") and custom.has("is_night"):
			return custom
	var raw_t = game.get("t")
	if typeof(raw_t) != TYPE_INT and typeof(raw_t) != TYPE_FLOAT:
		return out
	var t := float(raw_t)
	var raw_len = _const_value(game, "DAYLEN")
	if typeof(raw_len) != TYPE_INT and typeof(raw_len) != TYPE_FLOAT:
		out.time_label = "tick %d (DAYLEN unavailable)" % int(t)
		return out
	var daylen := float(raw_len)
	if daylen <= 0.0:
		out.time_label = "tick %d (DAYLEN unavailable)" % int(t)
		return out
	var day_num := int(t / daylen) + 1
	var frac := fmod(t, daylen) / daylen
	if frac < 0.0:
		frac += 1.0
	var night := frac > 0.64 and frac < 0.94
	if _argc0(game, "is_night"):
		night = bool(game.call("is_night"))
	elif _argc0(game, "night"):
		night = bool(game.call("night"))
	var year_bit := ""
	var eco = game.get("eco")
	if eco is Dictionary and eco.has("yr"):
		var yd = _const_value(game, "ECO_YD")
		if typeof(yd) != TYPE_INT and typeof(yd) != TYPE_FLOAT:
			yd = eco.get("yd", 0)
		if (typeof(yd) == TYPE_INT or typeof(yd) == TYPE_FLOAT) and float(yd) > 0.0:
			var yt = float(eco.get("yt", fmod(t, float(yd) * daylen)))
			var day_of_year := int(yt / daylen) + 1
			year_bit = "Year %s · day %d of %s · " % [str(eco["yr"]), day_of_year, str(int(yd))]
			day_num = day_of_year
	var phase := "night" if night else "daylight"
	out.day = day_num
	out.is_night = night
	out.time_label = "%sDay %d · %d%% through the day · %s · tick %d" % [year_bit, day_num, int(round(frac * 100.0)), phase, int(t)]
	return out

static func camera_spot() -> Dictionary:
	var spot := {"x": 0.0, "y": 0.0, "zoom": 1.0}
	var game := _autoload("Game")
	if game != null:
		var cam = game.get("cam")
		if cam is Dictionary:
			spot.x = float(cam.get("x", 0.0))
			spot.y = float(cam.get("y", 0.0))
			spot.zoom = float(cam.get("z", cam.get("zoom", cam.get("tz", 1.0))))
			return spot
		if cam is Object:
			var pos = cam.get("position")
			if pos is Vector2:
				spot.x = pos.x
				spot.y = pos.y
				var z = cam.get("zoom")
				if z is Vector2:
					spot.zoom = z.x
				elif typeof(z) == TYPE_FLOAT or typeof(z) == TYPE_INT:
					spot.zoom = float(z)
				elif cam.get("z") != null:
					spot.zoom = float(cam.get("z"))
				return spot
	var tree := Engine.get_main_loop()
	if tree is SceneTree:
		var vp := (tree as SceneTree).root.get_viewport()
		if vp != null:
			var c2 := vp.get_camera_2d()
			if c2 != null:
				spot.x = c2.global_position.x
				spot.y = c2.global_position.y
				spot.zoom = c2.zoom.x
				return spot
			var c3 := vp.get_camera_3d()
			if c3 != null:
				spot.x = c3.global_position.x
				spot.y = c3.global_position.y
				spot.zoom = c3.fov
	return spot

static func start_screen_record() -> Dictionary:
	if _clip != null and is_instance_valid(_clip) and bool(_clip.is_recording()):
		return _map_start(_clip.start())
	# Her panel stays as it is: this call hides it and unpauses, then ClipRec.start().
	_hide_panel_and_unpause()
	var clip := _ensure_clip()
	if clip == null:
		_show_panel_again()
		return {"ok": false, "error": _clip_error()}
	var mapped := _map_start(clip.start())
	if not bool(mapped.get("ok", false)):
		_show_panel_again()
	return mapped

static func stop_screen_record(dest_dir: String) -> Dictionary:
	if dest_dir.is_empty() or _is_forbidden(dest_dir) or not _under_reports(dest_dir):
		return {"ok": false, "path": "", "error": "Refusing to write a clip outside the bug-report folder."}
	if _clip == null or not is_instance_valid(_clip):
		if not ResourceLoader.exists(CLIP_REC_PATH):
			return {"ok": false, "path": "", "error": _clip_error()}
		return {"ok": false, "path": "", "error": "Not recording. No clip file was written."}
	# ClipRec requires the directory to exist. A missing folder must not consume the buffers.
	if not _dir_exists(dest_dir):
		return {"ok": false, "path": "", "error": "Report folder does not exist. Clip buffers were left in memory for a retry."}
	# After the 30s cap, is_recording() is false while frames are still buffered.
	var mapped := _flush_clip_into(dest_dir)
	if bool(mapped.get("ok", false)):
		_show_panel_again()
	return mapped

static func _map_start(started) -> Dictionary:
	if not (started is Dictionary):
		return {"ok": false, "error": "ClipRec.start returned an unexpected result."}
	var ok := bool(started.get("ok", false))
	var err := str(started.get("err", started.get("error", "")))
	if not ok and err == "":
		err = "ClipRec.start failed without a message."
	return {"ok": ok, "error": err}

static func _flush_clip_into(dest_dir: String) -> Dictionary:
	if _clip == null or not is_instance_valid(_clip):
		return {"ok": false, "path": "", "error": ""}
	var wrote = _clip.stop_and_write(dest_dir)
	if not (wrote is Dictionary):
		return {"ok": false, "path": "", "error": "ClipRec.stop_and_write returned an unexpected result."}
	var ok := bool(wrote.get("ok", false))
	var path := str(wrote.get("path", ""))
	var err := str(wrote.get("err", wrote.get("error", "")))
	if not ok and err == "":
		err = "ClipRec.stop_and_write failed without a message."
	return {"ok": ok, "path": path, "error": err}

static func _hide_panel_and_unpause() -> void:
	var panel := _find_panel()
	if panel != null:
		_hidden_panel = panel
		panel.visible = false
	var loop := Engine.get_main_loop()
	if loop is SceneTree:
		_paused_before = (loop as SceneTree).paused
		_pause_touched = true
		(loop as SceneTree).paused = false
	var game := _autoload("Game")
	if game != null:
		var spd = game.get("spd")
		if (typeof(spd) == TYPE_INT or typeof(spd) == TYPE_FLOAT) and float(spd) == 0.0:
			_spd_owner = game
			_spd_restore = spd
			game.set("spd", 1)

static func _show_panel_again() -> void:
	if _hidden_panel != null and is_instance_valid(_hidden_panel):
		_hidden_panel.visible = true
	_hidden_panel = null
	if _spd_owner != null and is_instance_valid(_spd_owner) and _spd_restore != null:
		_spd_owner.set("spd", _spd_restore)
	_spd_owner = null
	_spd_restore = null
	if _pause_touched:
		var loop := Engine.get_main_loop()
		if loop is SceneTree:
			(loop as SceneTree).paused = _paused_before
		_pause_touched = false

static func _find_panel() -> CanvasItem:
	var root := _root()
	if root == null:
		return null
	for node_name in ["BugReportPanel", "BugReport", "ReportPanel"]:
		var found := root.find_child(node_name, true, false)
		if found is CanvasItem:
			return found
	var pending: Array = []
	for child in root.get_children():
		pending.append(child)
	var seen := 0
	while pending.size() > 0 and seen < 2000:
		var node: Node = pending.pop_back()
		seen += 1
		var scr = node.get_script()
		if scr != null and node is CanvasItem:
			var path := str(scr.resource_path)
			if path.begins_with("res://ui/bug_report/") and path.find("bug_report_io") < 0:
				return node
		for child in node.get_children():
			pending.append(child)
	return null

static func is_recording() -> bool:
	# Do not create ClipRec here. Nothing records until start_screen_record().
	if _clip == null or not is_instance_valid(_clip):
		return false
	return bool(_clip.is_recording())

static func _ensure_clip() -> Node:
	if _clip != null and is_instance_valid(_clip):
		return _clip
	if not ResourceLoader.exists(CLIP_REC_PATH):
		return null
	var scr = load(CLIP_REC_PATH)
	if scr == null:
		return null
	var clip: Node = scr.new()
	if clip == null:
		return null
	var root := _root()
	if root == null:
		clip.free()
		return null
	clip.name = "BugReportClipRec"
	root.add_child(clip)
	_clip = clip
	return _clip

static func _clip_error() -> String:
	if _root() == null and ResourceLoader.exists(CLIP_REC_PATH):
		return "not wired: ClipRec could not be added to a scene tree, so recording did not start."
	return "not wired: res://core/clip_rec.gd (ClipRec, gilgamesh/engine @ 4baa26a) is not in this build. Screenshot, logs, save, and metadata still work."

static func _recording_already_in(dest_dir: String) -> String:
	var clip_json := _abs(dest_dir).path_join("clip.json")
	if not FileAccess.file_exists(clip_json):
		return "include_recording was set, but this folder has no clip.json yet. stop_screen_record writes the JPEG sequence and clip.json."
	var frames: PackedStringArray = PackedStringArray()
	var dir := DirAccess.open(_abs(dest_dir))
	if dir != null:
		for name in dir.get_files():
			var lower := str(name).to_lower()
			if lower.begins_with("clip_") and (lower.ends_with(".jpg") or lower.ends_with(".jpeg")):
				frames.append(str(name))
	frames.sort()
	return "clip.json (%d frame file(s): %s)" % [frames.size(), ", ".join(frames)]

static func _destination_root(work_exists: bool) -> String:
	if work_exists:
		if not _is_forbidden(WORK_REPORTS):
			return WORK_REPORTS
	if not _is_forbidden(FALLBACK_REPORTS):
		return FALLBACK_REPORTS
	var home := OS.get_environment("USERPROFILE")
	if home.is_empty():
		home = OS.get_environment("HOME")
	if not home.is_empty():
		var alt := home.replace("\\", "/").trim_suffix("/") + "/BnB-bug-reports"
		if not _is_forbidden(alt):
			return alt
	return ""

static func _work_exists() -> bool:
	return DirAccess.dir_exists_absolute("C:/BnB/Work") or DirAccess.dir_exists_absolute("C:\\BnB\\Work")

static func _is_forbidden(path: String) -> bool:
	if path.strip_edges().is_empty():
		return true
	var raw := path.replace("\\", "/")
	if raw.begins_with("res://"):
		return true
	var abs := _norm(_abs(path))
	var low := abs.to_lower()
	for ban in ["c:/bnb/play", "c:/bnb/downloads"]:
		if low == ban or low.begins_with(ban + "/"):
			return true
	return _beside_playable(abs)

static func _under_reports(path: String) -> bool:
	var root := destination_root()
	if root.is_empty():
		return false
	return _under_abs(_abs(path), _abs(root))

static func _beside_playable(abs_norm: String) -> bool:
	# The editor binary is not the playable build. An exported game must not
	# receive reports in the folder that contains its executable.
	if OS.has_feature("editor"):
		return false
	var exe := OS.get_executable_path()
	if exe.is_empty():
		return false
	var dir := _norm(exe.get_base_dir()).to_lower()
	if dir.is_empty() or dir == "/" or dir.ends_with(":"):
		return false
	var low := abs_norm.to_lower()
	return low == dir or low.begins_with(dir + "/")

static func _under_abs(child: String, parent: String) -> bool:
	var c := _norm(child).to_lower()
	var p := _norm(parent).to_lower()
	if p.is_empty():
		return false
	return c == p or c.begins_with(p + "/")

static func _norm(path: String) -> String:
	var s := path.replace("\\", "/").strip_edges()
	while s.ends_with("/"):
		s = s.substr(0, s.length() - 1)
	return s

static func _abs(path: String) -> String:
	var s := path.replace("\\", "/")
	if s.begins_with("user://") or s.begins_with("res://"):
		return ProjectSettings.globalize_path(s).replace("\\", "/")
	return s

static func _dir_exists(path: String) -> bool:
	return DirAccess.dir_exists_absolute(_abs(path))

static func _mkdir(path: String) -> Error:
	if _is_forbidden(path):
		return FAILED
	return DirAccess.make_dir_recursive_absolute(_abs(path))

static func _timestamp() -> String:
	var d := Time.get_datetime_dict_from_system()
	return "%04d%02d%02d-%02d%02d%02d" % [d.year, d.month, d.day, d.hour, d.minute, d.second]

static func _write_text(path: String, text: String) -> Error:
	var f := FileAccess.open(_abs(path), FileAccess.WRITE)
	if f == null:
		return FileAccess.get_open_error()
	f.store_string(text)
	f.close()
	return OK

static func _result(ok: bool, path: String, error: String) -> Dictionary:
	return {"ok": ok, "path": path, "error": error}

static func _root() -> Node:
	var loop := Engine.get_main_loop()
	if loop is SceneTree:
		return (loop as SceneTree).root
	return null

static func _autoload(node_name: String) -> Node:
	var root := _root()
	if root != null and root.has_node(node_name):
		return root.get_node(node_name)
	return null

static func _const_value(obj: Object, key: String):
	var scr = obj.get_script()
	if scr != null and scr.has_method("get_script_constant_map"):
		var constants: Dictionary = scr.get_script_constant_map()
		if constants.has(key):
			return constants[key]
	return obj.get(key)

static func _argc0(obj: Object, method_name: String) -> bool:
	for m in obj.get_method_list():
		if str(m.get("name", "")) == method_name and (m.get("args", []) as Array).is_empty():
			return true
	return false

static func _game_speed():
	var game := _autoload("Game")
	if game != null:
		for key in ["spd", "speed", "game_speed"]:
			var v = game.get(key)
			if typeof(v) == TYPE_INT or typeof(v) == TYPE_FLOAT:
				return v
	return Engine.time_scale

static func _copy_save(dest_dir: String) -> Dictionary:
	var src := _pick_save_path()
	if src.is_empty():
		return {"source": "", "copied": "", "error": "", "failed": false, "note": "No current save file was found."}
	var src_abs := _abs(src)
	if not FileAccess.file_exists(src_abs):
		return {"source": src, "copied": "", "error": "", "failed": false, "note": "Save path does not exist: %s" % src}
	var reader := FileAccess.open(src_abs, FileAccess.READ)
	if reader == null:
		return {"source": src_abs, "copied": "", "error": "Could not read the save (%s)." % error_string(FileAccess.get_open_error()), "failed": true}
	var length := reader.get_length()
	reader.close()
	if length > SAVE_AUTO_MAX and not _save_was_explicit():
		return {"source": src_abs, "copied": "", "bytes": length, "error": "", "failed": false, "note": "Save is %d bytes, over the %d byte copy cap, and was left untouched." % [length, SAVE_AUTO_MAX]}
	var ext := src_abs.get_extension()
	var dest_name := "save-copy" + ("." + ext if ext != "" else "")
	var dest_abs := _abs(dest_dir).path_join(dest_name)
	var err := DirAccess.copy_absolute(src_abs, dest_abs)
	if err != OK:
		return {"source": src_abs, "copied": "", "error": "Could not copy the save (%s)." % error_string(err), "failed": true}
	var src_md5 := FileAccess.get_md5(src_abs)
	var dst_md5 := FileAccess.get_md5(dest_abs)
	if src_md5 != dst_md5:
		return {"source": src_abs, "copied": dest_abs, "error": "Save copy checksum did not match the live save. The live save was only read.", "failed": true, "md5": src_md5, "copy_md5": dst_md5}
	return {"source": src_abs, "copied": dest_name, "bytes": length, "md5": src_md5, "error": "", "failed": false}

static var _explicit_save := false

static func _save_was_explicit() -> bool:
	return _explicit_save

static func _pick_save_path() -> String:
	_explicit_save = false
	var named := _save_from_autoload()
	if named != "":
		_explicit_save = true
		return named
	var candidates: Array = []
	for path in [
		"user://save.json",
		"user://save.dat",
		"user://savegame.json",
		"user://bronzeAndBloodSave",
		"user://bronzerTimeSave",
		"user://saves/save.json",
		"user://saves/autosave.json",
		"user://saves/slot0.sav",
		"user://saves.json",
	]:
		if FileAccess.file_exists(path):
			candidates.append(_abs(path))
	for folder in ["user://saves", "user://save", "user://slots"]:
		for f in _files_in(folder):
			if _save_file_ok(f, true):
				candidates.append(f)
	for f in _files_in("user://"):
		if _save_file_ok(f, false):
			candidates.append(f)
	return _newest(candidates)

static func _save_from_autoload() -> String:
	for node_name in ["Save", "Saves", "Game", "Sim", "State"]:
		var node := _autoload(node_name)
		if node == null:
			continue
		for method_name in ["bug_report_save_path", "get_save_path", "save_path", "current_save_path", "get_current_save_path"]:
			if _argc0(node, method_name):
				var value = node.call(method_name)
				if value is String and value != "" and FileAccess.file_exists(value):
					return value
	return ""

static func _save_file_ok(path: String, in_save_dir: bool) -> bool:
	var base := path.get_file().to_lower()
	if base.begins_with("."):
		return false
	if base.contains("terrain") or base.contains("cache") or base.contains("shader"):
		return false
	if _under_abs(path, _abs(FALLBACK_REPORTS)) or _under_abs(path, WORK_REPORTS):
		return false
	var ext := base.get_extension()
	if ext in ["png", "jpg", "jpeg", "webp", "wav", "ogg", "mp3", "import", "ctex", "log", "md", "txt"]:
		return false
	if base.contains("save") or base.contains("slot") or base.begins_with("bnbslot") or base in ["bronzeandbloodsave", "bronzertimesave"]:
		return true
	if in_save_dir and ext in ["json", "sav", "save", "dat", "tres", "res", "bin"]:
		return true
	return false

static func _newest(paths: Array) -> String:
	var best := ""
	var best_t := -1
	var seen := {}
	for item in paths:
		var s := str(item)
		if seen.has(s) or not FileAccess.file_exists(s):
			continue
		seen[s] = true
		var modified := FileAccess.get_modified_time(s)
		if modified >= best_t:
			best_t = modified
			best = s
	return best

static func _files_in(dir_path: String) -> PackedStringArray:
	var out := PackedStringArray()
	var abs := _abs(dir_path)
	var dir := DirAccess.open(abs)
	if dir == null:
		return out
	for name in dir.get_files():
		out.append(abs.path_join(str(name)))
	return out

static func _copy_logs(dest_dir: String) -> Dictionary:
	var log_dir := dest_dir.path_join("logs")
	if _mkdir(log_dir) != OK:
		return {"error": "Could not create the logs folder.", "files": []}
	var copied: Array = []
	var memory := _memory_log()
	if memory != "":
		if _write_text(log_dir.path_join("game-log.txt"), memory) == OK:
			copied.append("game-log.txt")
	var sources := _log_sources()
	var i := 0
	for src in sources:
		if i >= 8:
			break
		i += 1
		var base := src.get_file()
		var dest_name := base
		if FileAccess.file_exists(_abs(log_dir).path_join(dest_name)):
			dest_name = "%d-%s" % [i, base]
		var dest_abs := _abs(log_dir).path_join(dest_name)
		if _copy_tail(src, dest_abs, LOG_TAIL) == OK:
			copied.append(dest_name)
	var session := "Godot %s\nOS %s %s\nFile logging path %s\nLog files copied: %s\n" % [
		str(Engine.get_version_info()),
		OS.get_name(),
		OS.get_version(),
		str(ProjectSettings.get_setting("debug/file_logging/log_path", "user://logs/godot.log")),
		", ".join(copied) if copied.size() else "(none found)",
	]
	_write_text(log_dir.path_join("session.txt"), session)
	copied.append("session.txt")
	return {"files": copied, "error": ""}

static func _log_sources() -> PackedStringArray:
	var found: Array = []
	var configured := str(ProjectSettings.get_setting("debug/file_logging/log_path", "user://logs/godot.log"))
	if configured != "" and FileAccess.file_exists(configured):
		found.append(_abs(configured))
	for folder in ["user://logs", "user://log"]:
		for f in _files_in(folder):
			var ext := f.get_extension().to_lower()
			if ext == "log" or ext == "txt":
				found.append(f)
	for f in _files_in("user://"):
		if f.get_extension().to_lower() == "log":
			found.append(f)
	var unique: Array = []
	var seen := {}
	for f in found:
		var s := str(f)
		if seen.has(s):
			continue
		if _under_abs(s, _abs(FALLBACK_REPORTS)) or _under_abs(s, WORK_REPORTS):
			continue
		seen[s] = true
		unique.append(s)
	unique.sort_custom(func(a, b): return FileAccess.get_modified_time(str(a)) > FileAccess.get_modified_time(str(b)))
	var out := PackedStringArray()
	for s in unique:
		out.append(str(s))
	return out

static func _memory_log() -> String:
	var lines: PackedStringArray = PackedStringArray()
	for node_name in ["Game", "Log", "Logger"]:
		var node := _autoload(node_name)
		if node == null:
			continue
		var raw = node.get("log")
		if raw == null:
			raw = node.get("lines")
		if not (raw is Array) and not (raw is PackedStringArray):
			continue
		lines.append("# %s" % node_name)
		for item in raw:
			lines.append(str(item))
	return "\n".join(lines)

static func _copy_tail(src: String, dst: String, tail: int) -> Error:
	var f := FileAccess.open(src, FileAccess.READ)
	if f == null:
		return FileAccess.get_open_error()
	var size := f.get_length()
	var start := 0
	var note := ""
	if size > tail:
		start = size - tail
		f.seek(start)
		note = "[bug report] last %d bytes of %d from %s\n" % [tail, size, src]
	var data := f.get_buffer(size - start)
	f.close()
	var out := FileAccess.open(dst, FileAccess.WRITE)
	if out == null:
		return FileAccess.get_open_error()
	if note != "":
		out.store_string(note)
	out.store_buffer(data)
	out.close()
	return OK

static func _meta_text(meta: Dictionary) -> String:
	var clock: Dictionary = meta.get("clock", {})
	var cam: Dictionary = meta.get("camera", {})
	var save_info: Dictionary = meta.get("save", {})
	var lines: PackedStringArray = PackedStringArray()
	lines.append("Bronze and Blood bug report")
	lines.append("path: %s" % str(meta.get("path", "")))
	lines.append("destination root: %s" % str(meta.get("destination_root", "")))
	lines.append("timestamp: %s" % str(meta.get("timestamp", "")))
	lines.append("build tip: %s" % str(meta.get("build_tip", "")))
	lines.append("day: %s" % str(clock.get("day", "")))
	lines.append("time: %s" % str(clock.get("time_label", "")))
	lines.append("night: %s" % str(clock.get("is_night", "")))
	lines.append("camera: x=%s y=%s zoom=%s" % [str(cam.get("x", "")), str(cam.get("y", "")), str(cam.get("zoom", ""))])
	lines.append("speed: %s" % str(meta.get("speed", "")))
	lines.append("os: %s" % str(meta.get("os", "")))
	lines.append("godot: %s" % str(meta.get("godot", "")))
	lines.append("screenshot: %s" % str(meta.get("screenshot", "")))
	lines.append("save source: %s" % str(save_info.get("source", "")))
	lines.append("save copy: %s" % str(save_info.get("copied", "")))
	lines.append("save note: %s" % str(save_info.get("note", save_info.get("error", ""))))
	lines.append("recording: %s" % str(meta.get("recording", "")))
	lines.append("")
	return "\n".join(lines)
