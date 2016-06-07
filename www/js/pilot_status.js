/*
	Arsh Chauhan
	06/03/2016
	Public Domain
*/

/*
	pilot_status.js
	Class to handle pilot status.
	Used for backend pilot detection
*/

/*
	callbacks:
		update_heartbeats(): Pilot connected
		update_videobeats(): Pilot has video open
*/

//TO DO: Detect multiple pilots.

function pilot_status_t(ui)
{
	this.ui = ui;
	this.path = "frontendStatus";
	var _this = this;
	this.pilot_status=
	{
		heartbeats:0,
		videobeats:0
	}; 

	setInterval(function(){_this.upload();},10000);

}

pilot_status_t.prototype.clamp=function(beats)
{
	if(beats > 255)
		return 0;
	else
		return beats;

}

//Increments videobeats, signifies a video connection
pilot_status_t.prototype.update_videobeats=function()
{
	this.pilot_status.videobeats=this.clamp(this.pilot_status.videobeats+1);
}

//Increments heartbeats, signifies a pilot is connected 
pilot_status_t.prototype.update_heartbeats=function()
{
	this.pilot_status.heartbeats=this.clamp(this.pilot_status.heartbeats+1);
}

pilot_status_t.prototype.upload=function()
{
	if(!this.ui || !this.ui.robot || !this.ui.robot.name)
		return null;
	this.update_heartbeats();
	superstar_set(this.ui.robot,this.path,this.pilot_status);
}


