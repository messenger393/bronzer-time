extends SceneTree

# Headless check for path selection, save copy, screenshot, and the ClipRec wrapper.
# From a Godot 4.7 project that contains this folder:
#   godot --headless -s res://ui/bug_report/bug_report_io_test.gd
# A sibling res://fixture_game.gd (t / DAYLEN / cam) and res://build_tip.txt are optional.
# res://core/clip_rec.gd is optional: missing means recording reports "not wired".

const IO := preload("res://ui/bug_report/bug_report_io.gd")

var _failed := 0
var _made: Array = []

func _initialize() -> void:
	_run()
	_cleanup()
	quit(_failed)

func _run() -> void:
	print("editor feature ", OS.has_feature("editor"))
	print("destination ", IO.destination_root())
	_check(IO._destination_root(true) == "C:/BnB/Work/bug-reports", "Work folder maps to C:/BnB/Work/bug-reports")
	_check(IO._destination_root(false) == "user://bug-reports", "missing Work folder maps to user://bug-reports")
	_check(IO._is_forbidden("C:/BnB/Play/bug-reports/x"), "Play is forbidden")
	_check(IO._is_forbidden("C:\\BnB\\Downloads\\x"), "Downloads is forbidden")
	_check(IO._is_forbidden("c:/bnb/play"), "Play root is forbidden")
	_check(not IO._is_forbidden("C:/BnB/Work/bug-reports"), "Work reports are allowed")
	_check(not IO._is_forbidden("C:/BnB/Playground/notes"), "Playground is not Play")
	_check(IO._is_forbidden("res://ui/bug_report"), "res:// is forbidden")
	if DirAccess.dir_exists_absolute("C:/BnB/Work"):
		_check(IO.destination_root() == "C:/BnB/Work/bug-reports", "live destination is the Work folder")
	else:
		_check(IO.destination_root() == "user://bug-reports", "live destination is the user:// fallback")

	_maybe_fixture()
	_plant_save_and_log()

	var play_existed := DirAccess.dir_exists_absolute("C:/BnB/Play")
	var blocked: Dictionary = IO.write_report("C:/BnB/Play/bug-reports/nope", {"seen": "x", "doing": "y"})
	_check(blocked.get("ok", true) == false, "write_report refuses Play")
	_check(not DirAccess.dir_exists_absolute("C:/BnB/Play/bug-reports/nope"), "nothing was written under Play")
	if not play_existed:
		_check(not DirAccess.dir_exists_absolute("C:/BnB/Play"), "Play was not created")
	_check(not DirAccess.dir_exists_absolute(ProjectSettings.globalize_path("res://").path_join("C:")), "no C: folder beside the project")

	var downloads_existed := DirAccess.dir_exists_absolute("C:/BnB/Downloads")
	var downloads: Dictionary = IO.write_report("C:/BnB/Downloads/bug-reports/nope", {"seen": "x", "doing": "y"})
	_check(downloads.get("ok", true) == false, "write_report refuses Downloads")
	_check(not DirAccess.dir_exists_absolute("C:/BnB/Downloads/bug-reports/nope"), "nothing was written under Downloads")
	if not downloads_existed:
		_check(not DirAccess.dir_exists_absolute("C:/BnB/Downloads"), "Downloads was not created")

	var first := IO.make_report_dir()
	var second := IO.make_report_dir()
	_made.append(first)
	_made.append(second)
	_check(first != "" and second != "" and first != second, "two report folders in the same second")
	_check(first.begins_with(IO.destination_root() + "/"), "report folder is under the destination root")
	_check(IO._dir_exists(first), "report folder exists")

	var save_before := FileAccess.get_file_as_string(ProjectSettings.globalize_path("user://saves/current.json"))
	var img := Image.create(4, 4, false, Image.FORMAT_RGBA8)
	img.fill(Color(0.2, 0.4, 0.6, 1.0))
	var report: Dictionary = IO.write_report(first, {
		"seen": "The mill kept spinning after the workers left.",
		"doing": "I had just set speed to fast and opened the stockyard.",
		"screenshot": img,
		"include_recording": true,
	})
	print("write ", report)
	_check(report.get("ok", false) == true, "write_report ok")
	_check(str(report.get("error", "")) == "", "write_report error is empty")
	var used := str(report.get("path", ""))
	_check(used != "" and used.find("/BnB/Play") < 0 and used.find("/BnB/Downloads") < 0, "returned path is outside Play and Downloads")
	var proj := ProjectSettings.globalize_path("res://").replace("\\", "/")
	_check(not used.begins_with(proj), "report is not inside the project folder")

	var save_after := FileAccess.get_file_as_string(ProjectSettings.globalize_path("user://saves/current.json"))
	_check(save_before == save_after and save_before == "SAVE-MARKER-9f3", "live save bytes were not mutated")
	var copy_path := used.path_join("save-copy.json")
	_check(FileAccess.file_exists(copy_path), "save copy exists")
	_check(FileAccess.get_file_as_string(copy_path) == save_before, "save copy matches the live save")
	_check(FileAccess.get_md5(copy_path) == FileAccess.get_md5(ProjectSettings.globalize_path("user://saves/current.json")), "save checksums match")

	var desc := FileAccess.get_file_as_string(used.path_join("description.txt"))
	_check(desc.find("The mill kept spinning") >= 0 and desc.find("stockyard") >= 0, "both text fields were written")

	var shot := Image.new()
	_check(shot.load(used.path_join("screenshot.png")) == OK, "screenshot.png loads")
	var px := shot.get_pixel(1, 1)
	_check(absf(px.r - 0.2) < 0.02 and absf(px.g - 0.4) < 0.02 and absf(px.b - 0.6) < 0.02, "screenshot pixels match")

	_check(not FileAccess.file_exists(used.path_join("clip.json")), "write_report did not invent clip.json")
	_check(not FileAccess.file_exists(used.path_join("clip_0001.jpg")), "write_report did not invent a frame")

	var log_text := FileAccess.get_file_as_string(used.path_join("logs/godot.log"))
	_check(log_text.find("ENDMARKER") >= 0, "log tail keeps the newest bytes")
	_check(log_text.begins_with("[bug report] last"), "oversized log is truncated")
	_check(log_text.length() < 600000, "copied log is smaller than the source")
	_check(FileAccess.file_exists(used.path_join("logs/session.txt")), "session log note exists")

	var meta = JSON.parse_string(FileAccess.get_file_as_string(used.path_join("meta.json")))
	_check(meta is Dictionary, "meta.json parses")
	if meta is Dictionary:
		_check(meta.get("path", "") == used, "meta path matches the result")
		_check(FileAccess.file_exists(used.path_join("meta.txt")), "meta.txt exists")
		var clock: Dictionary = meta.get("clock", {})
		var cam: Dictionary = meta.get("camera", {})
		_check(clock.has("day") and clock.has("time_label") and clock.has("is_night"), "clock shape")
		_check(cam.has("x") and cam.has("y") and cam.has("zoom"), "camera shape")
		var game := root.get_node_or_null("Game")
		if game != null and game.has_method("is_bug_report_fixture"):
			_check(int(clock.get("day", -1)) == 3, "day from Game.t / DAYLEN")
			_check(bool(clock.get("is_night", false)), "night band from Game.t")
			_check(str(clock.get("time_label", "")).find("tick 1512") >= 0, "tick label")
			_check(is_equal_approx(float(cam.get("x", 0.0)), 12.5), "camera x")
			_check(is_equal_approx(float(cam.get("y", 0.0)), -4.0), "camera y")
			_check(is_equal_approx(float(cam.get("zoom", 0.0)), 1.25), "camera zoom")
			_check(int(meta.get("speed", -1)) == 2, "game speed")
			var mem := FileAccess.get_file_as_string(used.path_join("logs/game-log.txt"))
			_check(mem.find("alpha") >= 0 and mem.find("beta") >= 0, "in-memory game log copied")
		if FileAccess.file_exists("res://build_tip.txt"):
			var tip := FileAccess.get_file_as_string("res://build_tip.txt").strip_edges().split("\n")[0]
			_check(meta.get("build_tip", "") == tip, "build tip file")
			_check(IO.build_tip() == tip, "build_tip()")

	_recording()

func _recording() -> void:
	var panel := Control.new()
	panel.name = "BugReportPanel"
	panel.visible = true
	root.add_child(panel)
	paused = true
	var started: Dictionary = IO.start_screen_record()
	_check(started.has("ok") and started.has("error") and not started.has("err"), "start_screen_record keys")
	if not ResourceLoader.exists("res://core/clip_rec.gd"):
		_check(started.get("ok", true) == false, "start fails closed without ClipRec")
		_check(str(started.get("error", "")).find("not wired") >= 0, "missing ClipRec says not wired")
		_check(IO.is_recording() == false, "nothing records in the background")
		_check(panel.visible, "panel is shown again when record cannot start")
		_check(paused, "pause is restored when record cannot start")
		var stopped: Dictionary = IO.stop_screen_record("user://bug-reports/not-a-real-folder")
		_check(stopped.get("ok", true) == false, "stop fails closed without ClipRec")
		_check(not FileAccess.file_exists(ProjectSettings.globalize_path("user://bug-reports/not-a-real-folder").path_join("clip.json")), "stop did not invent a clip")
		panel.queue_free()
		return

	_check(started.get("ok", false) == true, "ClipRec start")
	_check(not panel.visible, "panel hides before ClipRec.start")
	_check(not paused, "game unpauses before ClipRec.start")
	_check(root.get_node_or_null("BugReportClipRec") != null, "ClipRec stays on the scene tree")
	_check(IO.is_recording(), "is_recording while the clip is open")
	var again: Dictionary = IO.start_screen_record()
	_check(again.get("ok", true) == false, "second start leaves the unsaved clip alone")
	_check(not panel.visible, "a refused second start leaves the panel hidden")
	var missing := IO.destination_root().path_join("missing-clip-dir")
	var held: Dictionary = IO.stop_screen_record(missing)
	_check(held.get("ok", true) == false, "stop into a missing folder does not consume buffers")
	_check(IO.is_recording(), "clip still held after a refused stop")
	var cap := root.get_node_or_null("BugReportClipRec")
	if cap != null and cap.has_method("debug_autocap"):
		cap.debug_autocap()
		_check(not IO.is_recording(), "30s cap clears is_recording while frames stay buffered")
	var folder := IO.make_report_dir()
	_made.append(folder)
	var wrote: Dictionary = IO.stop_screen_record(folder)
	_check(wrote.get("ok", false) == true, "stop_screen_record ok")
	_check(str(wrote.get("path", "")).ends_with("clip.json"), "stop path is clip.json")
	_check(not IO.is_recording(), "recording stopped")
	_check(panel.visible, "panel is shown after stop_and_write")
	_check(paused, "pause is restored after the clip is written")
	var abs_folder := ProjectSettings.globalize_path(folder) if folder.begins_with("user://") else folder
	_check(FileAccess.file_exists(abs_folder.path_join("clip.json")), "clip.json was written by ClipRec")
	_check(FileAccess.file_exists(abs_folder.path_join("clip_0001.jpg")), "frame was written by ClipRec")
	var before_frames := 0
	var listing := DirAccess.open(abs_folder)
	if listing != null:
		for name in listing.get_files():
			if str(name).begins_with("clip_"):
				before_frames += 1
	var follow: Dictionary = IO.write_report(folder, {"seen": "clip", "doing": "stop", "screenshot": null, "include_recording": true})
	_check(follow.get("ok", false) == true, "write_report after a real clip")
	var after_frames := 0
	listing = DirAccess.open(abs_folder)
	if listing != null:
		for name in listing.get_files():
			if str(name).begins_with("clip_"):
				after_frames += 1
	_check(after_frames == before_frames, "write_report did not add frames")
	var meta = JSON.parse_string(FileAccess.get_file_as_string(abs_folder.path_join("meta.json")))
	if meta is Dictionary:
		_check(str(meta.get("recording", "")).find("clip.json") >= 0, "metadata points at the clip ClipRec wrote")

func _maybe_fixture() -> void:
	if root.get_node_or_null("Game") != null:
		return
	if not ResourceLoader.exists("res://fixture_game.gd"):
		return
	var node: Node = load("res://fixture_game.gd").new()
	node.name = "Game"
	root.add_child(node)

func _plant_save_and_log() -> void:
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path("user://saves"))
	DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path("user://logs"))
	var save := FileAccess.open(ProjectSettings.globalize_path("user://saves/current.json"), FileAccess.WRITE)
	save.store_string("SAVE-MARKER-9f3")
	save.close()
	var log := FileAccess.open(ProjectSettings.globalize_path("user://logs/godot.log"), FileAccess.WRITE)
	log.store_string("A".repeat(600000) + "ENDMARKER")
	log.close()

func _cleanup() -> void:
	for path in _made:
		_rm(str(path))
	_rm("user://saves")
	_rm("user://logs")
	_rm("user://bug-reports")

func _rm(path: String) -> void:
	if path.is_empty():
		return
	var abs := path
	if path.begins_with("user://") or path.begins_with("res://"):
		abs = ProjectSettings.globalize_path(path)
	var dir := DirAccess.open(abs)
	if dir != null:
		for name in dir.get_files():
			DirAccess.remove_absolute(abs.path_join(str(name)))
		for name in dir.get_directories():
			_rm(abs.path_join(str(name)))
	DirAccess.remove_absolute(abs)

func _check(cond: bool, msg: String) -> void:
	if cond:
		print("ok  ", msg)
	else:
		_failed += 1
		print("FAIL ", msg)
