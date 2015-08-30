/**
  This is the new 2015-07 modular robot interface, with a row of buttons on top,
  and moveable "doorways" showing each robot interface element.
*/

//to add a widget, add an entry to create_widgets.
//if the widget has a download method, it will be called.
//if the widget has a upload method, add the callback in create_widgets.

function robot_ui_t(div)
{
	if(!div)
		return null;

	this.div=div;
	this.robot=
	{
		name:null,
		auth:null
	};
	this.disconnected_text="<font style='color:red;'>Not connected.</font>";

	this.state_runner=new state_runner_t();
	this.menu=null;
	this.connect_menu=null;
	this.gui=
	{
		element:null,
		interval:null,
		old:""
	};
	this.sensor_data_count=0;
	this.doorways={};
	this.widgets={};

	this.create_gui();

	var options=parse_uri(location.search);
	var myself=this;

	validate_robot_name(options.robot,
		function()
		{
			myself.robot.name=options.robot;
			myself.connect_menu.onconnect(myself.robot.name,myself.robot.auth);
		},
		function()
		{
			myself.connect_menu.show();
		});
}

robot_ui_t.prototype.create_menus=function()
{
	var myself=this;

	this.menu=new robot_menu_t(div);
	this.connect_menu=new modal_connect_t(div);

	this.menu.get_status_area().innerHTML=this.disconnected_text;
	this.menu.create_button
	(
		"Connect",
		function(){myself.connect_menu.show();},//null,
		"glyphicon glyphicon-off",//"glyphicon glyphicon-cog",
		null,
		"Connect to a new robot over the network"
	);

	this.connect_menu.onconnect=function(robot_name,robot_auth)
	{
		if(robot_name)
		{
			myself.robot.name=null;
			clearInterval(myself.gui.interval);
			myself.gui.interval=null;
			myself.robot.name=robot_name;
			myself.robot.auth=robot_auth;
			myself.menu.get_status_area().innerHTML="Connected to \""+myself.robot.name+"\"";

			myself.download_gui();
		}
	};
}


robot_ui_t.prototype.create_gui=function()
{
	this.create_menus();
	this.gui.element=new doorways_t(div,this.menu.get_menu_bar());
}

robot_ui_t.prototype.download_gui=function()
{
	if(!this.robot||!this.robot.name)
		return;

	var myself=this;

	var clear_out=function(div)
	{
		while(div.firstChild)
			div.removeChild(div.firstChild);
	}

	superstar_get(this.robot.name,"gui",function(json)
	{
		myself.doorways=
		{
			config:myself.create_doorway("Configure","Set up robot hardware"),
			pilot:myself.create_doorway("Drive","Manually drive the robot"),
			sensors:myself.create_doorway("Sensors","Examine sensor data from robot"),
			states:myself.create_doorway("Code","Automatically drive the robot"),
			map:myself.create_doorway("Map","See where the robot thinks it is"),
			video:myself.create_doorway("Video","Show the robot's video camera")
		};

		clear_out(myself.doorways.config.content);
		clear_out(myself.doorways.pilot.content);
		clear_out(myself.doorways.sensors.content);
		clear_out(myself.doorways.states.content);
		clear_out(myself.doorways.map.content);
		clear_out(myself.doorways.video.content);

		myself.gui.element.hide_all();
		myself.gui.element.minimize(myself.doorways.config,false);

		myself.gui.element.load(json);
		myself.create_widgets();

		for(var key in myself.widgets)
			if(myself.widgets[key].download)
				myself.widgets[key].download(myself.robot);

		myself.gui.interval=setInterval(function(){myself.run_interval();},100);
	});
}

robot_ui_t.prototype.run_interval=function() {
	// Update sensor data
	var myself=this;

	if (myself.sensor_data_count<2)
	{ // request more sensor data
		this.sensor_data_count++;
		superstar_get(this.robot.name,"sensors",
			function(sensors) // sensor data has arrived:
			{
				myself.sensor_data_count--;
				myself.widgets.sensors.refresh(sensors);
				myself.widgets.map.refresh(sensors);

				myself.state_runner.VM_sensors=sensors;
			});
	}

	this.upload_gui();
}

robot_ui_t.prototype.upload_gui=function()
{
	var save=this.gui.element.save();
	var stringified=JSON.stringify(save);

	if(this.robot&&this.robot.name&&this.gui.old!=stringified)
	{
		superstar_set(this.robot.name,"gui",save,null,this.robot.auth);
		this.gui.old=stringified;
	}
}

robot_ui_t.prototype.create_widgets=function()
{
	var myself=this;

	this.widgets=
	{
		config:new config_editor_t(this.doorways.config.content),
		states:new state_table_t(this.doorways.states),
		pilot:new pilot_interface_t(this.doorways.pilot.content),
		sensors:new tree_viewer_t(this.doorways.sensors.content,{}),
		map:new robot_map_t(this.doorways.map.content,{}),
		video:new video_widget_t(this.doorways.video)
	};

	this.widgets.config.onchange=function() { // recreate pilot GUI when configuration changes
		myself.widgets.pilot.reconfigure(myself.widgets.config);
	}

	this.widgets.config.onconfigure=function() // allow configuration upload
	{
		if(myself.robot&&myself.robot.name)
			myself.widgets.config.upload(myself.robot);
	}
	this.widgets.states.onrun=function()
	{
		if(myself.robot.name)
		{
			myself.state_runner.VM_power=myself.widgets.pilot.pilot.power;
			myself.state_runner.run(myself.robot,myself.widgets.states);
		}
	}
	this.widgets.states.onstop=function()
	{
		if(myself.robot.name)
			myself.state_runner.stop(myself.widgets.states);
	}
	this.widgets.pilot.onpilot=myself.state_runner.onpilot=function(power)
	{
		console.log("Pilot data upload: "+myself.robot.name);
		if(myself.robot.name)
			myself.widgets.pilot.upload(myself.robot);
	}
}

robot_ui_t.prototype.create_doorway=function(title,tooltip)
{
	var doorway=this.gui.element.get_by_title(title);

	if(doorway)
		return doorway;
	else
		return this.gui.element.create(title,undefined,tooltip);
}
