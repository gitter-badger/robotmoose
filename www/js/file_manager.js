/*Usage:
	var file_div=document.getElementById("filediv");
	var file_manager=new file_manager_t(file_div);

	if(!file_manager)
		alert("Could not create file manager!");

	//Callbacks when saved or loaded
	file_manager.onload=function(filename,data){alert("loaded "+filename+"\n"+data);}
	file_manager.onsave=function(filename){alert("saved "+filename);return "hello";}

	//Set default filename to save as:
	file_manager.set_save_filename("tester.txt");

	//Force save:
	file_manager.save();
*/

function file_manager_t(div)
{
	if(!div)
		return null;

	this.div=div;
	this.element=document.createElement("div");
	this.data="";

	var myself=this;

	this.prettifier=document.createElement("div");
	this.prettifier.className="form-inline";

	this.loader={};
	this.loader.span=document.createElement("span");
	this.loader.span.className="file-input btn btn-primary btn-file";
	this.loader.text=document.createTextNode("Load");
	this.create_loader();
	this.loader.span.appendChild(this.loader.text);
	this.loader.span.appendChild(this.loader.input);


	this.saver={};
	this.saver.input=document.createElement("input");
	this.saver.input.type="text";
	this.saver.input.className="form-control";
	this.saver.input.onchange=function(){myself.refresh();};
	this.saver.button=document.createElement("input");
	this.saver.button.type="button";
	this.saver.button.className="btn btn-primary";
	this.saver.button.value="Save";
	this.saver.button.disabled=true;
	this.saver.button.onclick=function(){myself.save();};

	this.prettifier.appendChild(this.saver.input);
	this.prettifier.appendChild(this.saver.button);
	this.prettifier.appendChild(this.loader.span);
	this.element.appendChild(this.prettifier);
	this.div.appendChild(this.element);
}

file_manager_t.prototype.get_data=function()
{
	return this.data;
}

file_manager_t.prototype.set_save_filename=function(filename)
{
	this.saver.input.value=filename;
	this.saver.button.disabled=!this.saver.input.value;
}

file_manager_t.prototype.load=function()
{
	if(this.loader.input.files[0])
	{
		var myself=this;
		var reader=new FileReader();

		reader.onload=function(event)
		{
			myself.data=event.target.result;
			var filename=myself.loader.input.files[0].name;

			if(myself.onload)
				myself.onload(filename,myself.data);

			myself.create_loader();
			myself.saver.input.value=filename;
			myself.refresh();
		};

		reader.readAsText(this.loader.input.files[0],"UTF-8");
	}
}

file_manager_t.prototype.save=function()
{
	if(this.onsave)
		this.data=this.onsave(this.saver.input.value);

	if(this.saver.input.value)
	{
		var blob=new Blob([this.data],{type:'text/plain'});
		var link=document.createElement("a");
		link.download=this.saver.input.value;
		link.innerHTML="Download File";
		link.href=window.URL.createObjectURL(blob);
		link.onclick=function(event){document.body.removeChild(event.target);};
		link.style.display="none";
		document.body.appendChild(link);
		link.click();
	}
}

file_manager_t.prototype.create_loader=function()
{
	var myself=this;

	if(this.loader&&this.loader.span&&this.loader.input)
	{
		this.loader.span.removeChild(this.loader.input);
		this.loader.input=null;
	}

	this.loader.input=document.createElement("input");
	this.loader.input.type="file";
	this.loader.input.multiple=true;
	this.loader.input.onchange=function(){myself.load();};
	this.loader.span.appendChild(this.loader.input);
}

file_manager_t.prototype.refresh=function()
{
	this.saver.button.disabled=!this.saver.input.value;
}