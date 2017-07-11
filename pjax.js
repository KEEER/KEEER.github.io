/*
  pjax library for personal use
  @author Alan?Liang
*/

var pjax={};
pjax.pagecount=0;
pjax.pages=[];
/*
  class pjax.page(string title,string url,function callback)
  @param title the title of the page
  @param url the url eg. '/index.html'
  @param callback the function to call when jumped to the page
  
  usage:
  var page=new pjax.page("title","/url",function(){callback;});
  var id=page.id;
  
  reminder:please enable the user to go back to your first page by calling this:
    pjax.history[0].callback=function(){do_something();};
    pjax.pages[0]=pjax.history[0];
*/
pjax.page=function(title,url,callback){
	this.title=title;
	this.url=url;
	this.callback=callback;
	this.id=pjax.pagecount;
	pjax.pagecount++;
	pjax.pages.push(this);
};
pjax.page.prototype.type="page";

pjax.history=[new pjax.page(document.title,window.location.pathname+window.location.search)];
pjax.forward=[];
/*
  function pjax.push(int page) throws noPageError
  function pjax.push(pjax.page page) throws noPageError
  @param page the page id or the page object
  
  usage:
  pjax.push(pageobj.id);//1
  pjax.push(pageobj);
*/
pjax.push=function(page){
	var type=typeof page;
	if(type=="object")type=page.type;
	var pageobj;
	switch(type){
		case "number":
		pageobj=pjax.pages[page];
		break;
		
		case "page":
		pageobj=page;
		break;
		
		default:
		break;
	}
	if(!pageobj)throw new Error("undefined page");
	var pagepushed=false;
	for(var i=0;i<pjax.history.length;i++){
		if(pjax.history[i].id==pageobj.id)
			pagepushed=i;
	}
	if(typeof pagepushed=="boolean"){
		pjax.history.push(pageobj);
		document.title=pageobj.title;
		history.pushState('',{state:pageobj.id},pageobj.url);
		pjax.forward=[];
		pageobj.callback();
	}else{
		for(var i=pjax.history.length-1;i>pagepushed;i--){
			document.title=pageobj.title;
			history.go(-1);
		}
	}
};

/* onpopstate */
window.onpopstate=function(e){
	var state=e.state?e.state.state:null;
	if(!state){
		for(var i=0;i<pjax.pages.length;i++){
			if(pjax.pages[i].url==(window.location.pathname+window.location.search))
				state=pjax.pages[i].id;
		}
	}
	if(typeof state=="undefined"){
		throw new Error("what is the page??? the page is: "+(window.location.pathname+window.location.search));
		return;
	}
	var pagepushed=false;
	for(var i=0;i<pjax.forward.length;i++){
		if(pjax.forward[i].id==state)
			pagepushed=i;
	}
	for(var i=0;i<pjax.history.length;i++){
		if(pjax.history[i].id==state)
			pagepushed=(-1)*(i+1);
	}
	if(typeof pagepushed=="boolean"){
		var pageobj;
		for(var i=0;i<pjax.pages.length;i++){
			if(pjax.pages[i].url==(window.location.pathname+window.location.search))
				pageobj=pjax.pages[i];
		}
		pjax.history.push(pageobj);
		pjax.forward=[];
		document.title=pageobj.title;
		pageobj.callback();
	}else{
		if(pagepushed<0){
			for(var i=pjax.history.length-1;i>(-1)*pagepushed-1;i--){
				pjax.forward.push(pjax.history.pop());
			}
			document.title=pjax.history[pjax.history.length-1].title;
			pjax.history[pjax.history.length-1].callback();
		}else{
			for(var i=pjax.forward.length-1;i>pagepushed;i--){
				pjax.history.push(pjax.forward.pop());
			}
			document.title=pjax.forward[pjax.forward.length-1].title;
			pjax.forward[pjax.forward.length-1].callback();
		}
	}
};


