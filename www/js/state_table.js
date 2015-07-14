//Members
//		onrefresh() - callback triggered when window changes
//		onrun() - callback triggered when run button is hit

function state_table_t(div)
{
	if(!div)
		return null;

	var myself=this;
	this.div=div;
	this.element=document.createElement("div");
	this.drag_list=new drag_list_t(this.element);
	this.run_button=document.createElement("input");
	this.add_button=document.createElement("input");
	this.entries=[];

	if(!this.drag_list)
	{
		this.div=null;
		this.element=null;
	}

	this.element.style.width=640;
	this.div.appendChild(this.element);

	this.run_button.type="button";
	this.run_button.className="btn btn-primary";
	this.run_button.disabled=true;
	this.run_button.value="Run";
	this.run_button.onclick=function(event){if(myself.onrun)myself.onrun(myself);};
	this.element.appendChild(this.run_button);

	this.add_button.type="button";
	this.add_button.className="btn btn-primary";
	this.add_button.style.marginLeft=10;
	this.add_button.disabled=true;
	this.add_button.value="Add State";
	this.add_button.onclick=function(event){myself.create_entry("newState","// JavaScript code\n\n");};
	this.element.appendChild(this.add_button);
}

state_table_t.prototype.download=function(robot_name)
{
	for(var key in this.entries)
		this.remove_entry(this.entries[key]);

	this.run_button.disabled=true;
	this.add_button.disabled=true;

	if(!robot_name)
		return;

	var myself=this;
	this.run_button.disabled=false;
	this.add_button.disabled=false;

	try
	{
		send_request("GET","/superstar/"+robot_name,"states","?get",
			function(response)
			{
				if(response)
				{
					var obj=JSON.parse(response);

					for(var key in obj)
						myself.create_entry(obj[key].name,obj[key].code);
				}
			},
			function(error)
			{
				throw error;
			},
			"application/json");
	}
	catch(error)
	{
		console.log("state_table_t::download() - "+error);
	}
}

state_table_t.prototype.upload=function(robot_name)
{
	if(!robot_name)
		return;

	this.get_entries();

	try
	{
		var data=[];

		this.get_entries();

		for(var key in this.entries)
		{
			if(this.entries[key])
			{
				var obj={};
				obj.name=this.entries[key].input.value;
				obj.code=this.entries[key].code_editor.getValue();
				data.push(obj);
			}
		}

		send_request("GET","/superstar/"+robot_name,"states",
			"?set="+encodeURIComponent(JSON.stringify(data)),
			function(response)
			{
			},
			function(error)
			{
				throw error;
			},
			"application/json");
	}
	catch(error)
	{
		console.log("state_table_t::upload() - "+error);
	}
}

state_table_t.prototype.get_entries=function()
{
	this.entries.sort(function(lhs,rhs)
	{
		if(lhs&&rhs)
			return lhs.drag_list.li.offsetTop-rhs.drag_list.li.offsetTop;
	});

	return this.entries;
}

state_table_t.prototype.create_entry=function(state,code)
{
	if(!state||!code)
		return null;

	var myself=this;
	var entry={};
	entry.drag_list=this.drag_list.create_entry();
	entry.drag_list.state_table_t=entry;
	entry.drag_list.onremove=function(entry){myself.remove_entry_m(entry.state_table_t);};
	this.create_entry_m(entry,state,code);
	this.entries.push(entry);

	return entry;
}

state_table_t.prototype.remove_entry=function(entry)
{
	if(!entry||!entry.drag_list)
		return;

	this.drag_list.remove_entry(entry.drag_list);
}










state_table_t.prototype.refresh_m=function()
{
	if(this.onrefresh)
		this.onrefresh();
}

state_table_t.prototype.create_entry_m=function(entry,state,code)
{
	if(!entry||!entry.drag_list||!state||!code)
		return;

	var myself=this;
	entry.table={};
	entry.table.element=document.createElement("table");
	entry.table.row=entry.table.element.insertRow(0);
	entry.table.left=entry.table.row.insertCell(0);
	entry.table.right=entry.table.row.insertCell(1);
	entry.input=document.createElement("input");
	entry.textarea=document.createElement("textarea");

	entry.table.row.style.verticalAlign="top";
	entry.table.left.style.paddingRight=10;
	entry.drag_list.content.appendChild(entry.table.element);

	entry.input.type="text";
	entry.input.className="form-control";
	entry.input.spellcheck=false;
	entry.input.size=10;
	entry.input.value=state;
	entry.input.onblur=function(event){myself.validate_m(this);};
	entry.input.onchange=function(event){myself.validate_m(this);};
	entry.input.onkeydown=function(event){myself.validate_m(this);};
	entry.input.onkeyup=function(event){myself.validate_m(this);};
	entry.input.onkeypress=function(event){myself.validate_m(this);};
	this.validate_m(entry.input);
	entry.table.left.appendChild(entry.input);

	entry.textarea.innerHTML=code;
	entry.table.right.appendChild(entry.textarea);

	entry.code_editor=CodeMirror.fromTextArea(entry.textarea,
		{indentUnit:4,indentWithTabs:true,lineNumbers:true,
			matchBrackets:true,mode:"text/x-javascript"});
	entry.code_editor.setSize(320,100);
	entry.code_editor_event=function(event){entry.code_editor.refresh();};
	window.addEventListener("click",entry.code_editor_event);

	this.refresh_m();
}

state_table_t.prototype.remove_entry_m=function(entry)
{
	if(!entry)
		return;

	for(var key in this.entries)
	{
		if(this.entries[key]&&this.entries[key]===entry)
		{
			window.removeEventListener("click",this.entries[key].code_editor_event);
			this.entries[key]=null;
			break;
		}
	}

	this.refresh_m();
}

state_table_t.prototype.validate_m=function(input)
{
	while(input.value.length>0&&!isident(input.value))
		input.value=input.value.substr(0,input.value.length-1);
}