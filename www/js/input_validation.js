function isalpha(c)
{
	return (((c>='a')&&(c<='z'))||((c>='A')&&(c<='Z')));
}

function isdigit(c)
{
	return ((c>='0')&&(c<='9'));
}

function isalnum(c)
{
	return (isalpha(c)||isdigit(c));
}

function isident(value)
{
	if(value.length<=0)
		return false;

	if(!isalpha(value[0])&&value[0]!='_')
		return false;

	for(var ii=1;ii<value.length;++ii)
		if(!isalnum(value[ii])&&value[ii]!='_')
			return false;

	return true;
}

function is_int(str)
{
	for(var ii=0;ii<str.length;++ii)
		if(str[ii]<'0'||str[ii]>'9')
			return false;

	return true;
}

function is_pin(arg)
{
	if(!arg)
		return false;

	arg=arg.toLowerCase();

	return ((arg.length>0&&is_int(arg)&&arg>1)||
		(arg.length>0&&arg[0]=='a'&&is_int(arg.substr(1,arg.length-1))));
}

function is_serial(arg)
{
	if(!arg)
		return false;

	arg=arg.toLowerCase();

	if(arg.length>0&&arg[0]=='x'&&is_int(arg.substr(1,arg.length-1)))
	{
		var port=parseInt(arg.substr(1,arg.length-1));
		return (port>=0&&port<=3);
	}

	return false;
}

function arrays_equal(lhs,rhs)
{
	if(!lhs||!rhs||lhs.length!=rhs.length)
		return false;

	for(var ii=0;ii<lhs.length;++ii)
		if(lhs[ii]!=rhs[ii])
			return false;

	return true;
}

function parse_identifier(str)
{
	var identifier="";

	if(str.length>0&&!((str[0]>='a'&&str[0]<='z')||str[0]=='_'))
		return "";

	for(var ii=0;ii<str.length;++ii)
	{
		if((str[ii]>='a'&&str[ii]<='z')||(str[ii]>='0'&&str[ii]<='9')||str[ii]=='_')
			identifier+=str[ii];
		else
			break;
	}

	return identifier;
}

function parse_argument(str)
{
	var argument="";

	for(var ii=0;ii<str.length;++ii)
	{
		if((str[ii]>='a'&&str[ii]<='z')||(str[ii]>='0'&&str[ii]<='9'))
			argument+=str[ii];
		else
			break;
	}

	return argument;
}

function parse_symbol(str,symbol)
{
	return (str.length>0&&str[0]==symbol);
}

function skip_whitespace(str,col,line)
{
	while(str.length>0&&(str[0]==' '||str[0]=='\t'||str[0]=='\n'||str[0]=='\r'))
	{
		if(str[0]=='\n'||str[0]=='\r')
		{
			col=0;
			++line;
		}
		else
		{
			++col;
		}

		str=str.substring(1,str.length);
	}

	return {str:str,col:col,line:line};
}