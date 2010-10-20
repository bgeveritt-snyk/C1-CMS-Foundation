bespin.tiki.register("::cs_syntax",{name:"cs_syntax",dependencies:{standard_syntax:"0.0.0"}});
bespin.tiki.module("cs_syntax:index",function(b,e){b=b("standard_syntax").StandardSyntax;e.CSSyntax=new b({start:[{regex:/^(?:abstract|as|base|bool|break|byte|case|catch|char|checked|class|const|continue|decimal|default|delegate|do|double|else|enum|event|explicit|extern|false|finally|fixed|float|for|foreach|goto|if|implicit|in|in|int|interface|internal|is|lock|long|namespace|new|null|object|operator|out|out|override|params|private|protected|public|readonly|ref|return|sbyte|sealed|short|sizeof|stackalloc|static|string|struct|switch|this|throw|true|try|typeof|uint|ulong|unchecked|unsafe|ushort|using|virtual|void|volatile|while|add|alias|ascending|descending|dynamic|from|get|global|group|into|join|let|orderby|partial|remove|select|set|value|var|where|yield)(?![a-zA-Z0-9_])/,tag:"keyword"},
{regex:/^<[A-Za-z_][A-Za-z0-9_]*>/,tag:"operator"},{regex:/^[A-Za-z_][A-Za-z0-9_]*/,tag:"identifier"},{regex:/^[^'"\/ \tA-Za-z0-9_]+/,tag:"plain"},{regex:/^[ \t]+/,tag:"plain"},{regex:/^'(?=.)/,tag:"string",then:"qstring"},{regex:/^"(?=.)/,tag:"string",then:"qqstring"},{regex:/^\/\/.*/,tag:"comment"},{regex:/^\/\*/,tag:"comment",then:"comment"},{regex:/^./,tag:"plain"}],qstring:[{regex:/^(?:\\.|[^'\\])*'?/,tag:"string",then:"start"}],qqstring:[{regex:/^(?:\\.|[^"\\])*"?/,tag:"string",then:"start"}],
comment:[{regex:/^[^*\/]+/,tag:"comment"},{regex:/^\*\//,tag:"comment",then:"start"},{regex:/^[*\/]/,tag:"comment"}]})});bespin.tiki.register("::sql_syntax",{name:"sql_syntax",dependencies:{syntax_manager:"0.0.0"}});
bespin.tiki.module("sql_syntax:index",function(b,e){b=b("standard_syntax").StandardSyntax;e.SQLSyntax=new b({start:[{regex:/^(?:ADD|ALL|ALLOCATE|ALTER|AND|ANY|ARE|ARRAY|AS|ASENSITIVE|ASYMMETRIC|AT|ATOMIC|AUTHORIZATION|BEGIN|BETWEEN|BIGINT|BINARY|BLOB|BOOLEAN|BOTH|BY|CALL|CALLED|CASCADED|CASE|CAST|CHAR|CHARACTER|CHECK|CLOB|CLOSE|COLLATE|COLUMN|COMMIT|CONDITION|CONNECT|CONSTRAINT|CONTINUE|CORRESPONDING|CREATE|CROSS|CUBE|CURRENT|CURRENT_DATE|CURRENT_DEFAULT_TRANSFORM_GROUP|CURRENT_PATH|CURRENT_ROLE|CURRENT_TIME|CURRENT_TIMESTAMP|CURRENT_TRANSFORM_GROUP_FOR_TYPE|CURRENT_USER|CURSOR|CYCLE|DATE|DAY|DEALLOCATE|DEC|DECIMAL|DECLARE|DEFAULT|DELETE|DEREF|DESCRIBE|DETERMINISTIC|DISCONNECT|DISTINCT|DO|DOUBLE|DROP|DYNAMIC|EACH|ELEMENT|ELSE|ELSEIF|END|ESCAPE|EXCEPT|EXEC|EXECUTE|EXISTS|EXIT|EXTERNAL|FALSE|FETCH|FILTER|FLOAT|FOR|FOREIGN|FREE|FROM|FULL|FUNCTION|GET|GLOBAL|GRANT|GROUP|GROUPING|HANDLER|HAVING|HOLD|HOUR|IDENTITY|IF|IMMEDIATE|IN|INDICATOR|INNER|INOUT|INPUT|INSENSITIVE|INSERT|INT|INTEGER|INTERSECT|INTERVAL|INTO|IS|ITERATE|JOIN|LANGUAGE|LARGE|LATERAL|LEADING|LEAVE|LEFT|LIKE|LOCAL|LOCALTIME|LOCALTIMESTAMP|LOOP|MATCH|MEMBER|MERGE|METHOD|MINUTE|MODIFIES|MODULE|MONTH|MULTISET|NATIONAL|NATURAL|NCHAR|NCLOB|NEW|NO|NONE|NOT|NULL|NUMERIC|OF|OLD|ON|ONLY|OPEN|OR|ORDER|OUT|OUTER|OUTPUT|OVER|OVERLAPS|PARAMETER|PARTITION|PRECISION|PREPARE|PRIMARY|PROCEDURE|RANGE|READS|REAL|RECURSIVE|REF|REFERENCES|REFERENCING|RELEASE|REPEAT|RESIGNAL|RESULT|RETURN|RETURNS|REVOKE|RIGHT|ROLLBACK|ROLLUP|ROW|ROWS|SAVEPOINT|SCOPE|SCROLL|SEARCH|SECOND|SELECT|SENSITIVE|SESSION_USER|SET|SIGNAL|SIMILAR|SMALLINT|SOME|SPECIFIC|SPECIFICTYPE|SQL|SQLEXCEPTION|SQLSTATE|SQLWARNING|START|STATIC|SUBMULTISET|SYMMETRIC|SYSTEM|SYSTEM_USER|TABLE|TABLESAMPLE|THEN|TIME|TIMESTAMP|TIMEZONE_HOUR|TIMEZONE_MINUTE|TO|TRAILING|TRANSLATION|TREAT|TRIGGER|TRUE|UNDO|UNION|UNIQUE|UNKNOWN|UNNEST|UNTIL|UPDATE|USER|USING|VALUE|VALUES|VARCHAR|VARYING|WHEN|WHENEVER|WHERE|WHILE|WINDOW|WITH|WITHIN|WITHOUT|YEAR)(?![a-zA-Z0-9_])/i,tag:"keyword"},
{regex:/^[A-Za-z_][A-Za-z0-9_]*/,tag:"identifier"},{regex:/^[^'"-\/ \tA-Za-z0-9_]+/,tag:"plain"},{regex:/^[ \t]+/,tag:"plain"},{regex:/^''/,tag:"string",then:"qqqstring"},{regex:/^'''/,tag:"string",then:"qqqqstring"},{regex:/^'/,tag:"string",then:"qstring"},{regex:/^"/,tag:"string",then:"qqstring"},{regex:/^--.*/,tag:"comment"},{regex:/^\/\*/,tag:"comment",then:"comment"},{regex:/^./,tag:"plain"}],qstring:[{regex:/^'/,tag:"string",then:"start"},{regex:/^(?:\\.|[^'\\])+/,tag:"string"}],qqstring:[{regex:/^"/,
tag:"string",then:"start"},{regex:/^(?:\\.|[^"\\])+/,tag:"string"}],qqqstring:[{regex:/^''/,tag:"string",then:"start"},{regex:/^(?:\\.|[^'\\])*''?/,tag:"string"}],qqqqstring:[{regex:/^'''/,tag:"string",then:"start"},{regex:/^(?:\\.|[^'\\])*'''?/,tag:"string"}],comment:[{regex:/^[^*\/]+/,tag:"comment"},{regex:/^\*\//,tag:"comment",then:"start"},{regex:/^[*\/]/,tag:"comment"}]})});bespin.tiki.register("::syntax_worker",{name:"syntax_worker",dependencies:{syntax_directory:"0.0.0",underscore:"0.0.0"}});
bespin.tiki.module("syntax_worker:index",function(b,e){var c=b("bespin:promise"),d=b("underscore")._;b("bespin:console");var a=b("syntax_directory").syntaxDirectory;e.syntaxWorker={engines:{},annotate:function(f,m){function n(i){return i.split(":")}function o(){p.push(d(g).invoke("join",":").join(" "))}var l=this.engines,p=[],j=[],q=[],g=d(f.split(" ")).map(n);d(m).each(function(i){o();for(var r=[],t={},k=0;k<i.length;){for(var s;;){s=d(g).last();if(s.length<3)break;var h=s[2];if(i.substring(k,k+
h.length)!==h)break;g.pop()}h=l[s[0]].get(s,i,k);if(h==null)k={state:"plain",tag:"plain",start:k,end:i.length};else{g[g.length-1]=h.state;h.hasOwnProperty("newContext")&&g.push(h.newContext);k=h.token;h=h.symbol;if(h!=null)t["-"+h[0]]=h[1]}r.push(k);k=k.end}j.push(r);q.push(t)});o();return{states:p,attrs:j,symbols:q}},loadSyntax:function(f){var m=new c.Promise,n=this.engines;if(n.hasOwnProperty(f)){m.resolve();return m}var o=a.get(f);if(o==null)throw new Error('No syntax engine installed for syntax "'+
f+'".');o.extension.load().then(function(l){n[f]=l;l=l.subsyntaxes;l==null?m.resolve():c.group(d(l).map(this.loadSyntax,this)).then(d(m.resolve).bind(m))}.bind(this));return m}}});bespin.tiki.register("::stylesheet",{name:"stylesheet",dependencies:{standard_syntax:"0.0.0"}});
bespin.tiki.module("stylesheet:index",function(b,e){b("bespin:promise");b=b("standard_syntax").StandardSyntax;var c={regex:/^\/\/.*/,tag:"comment"},d=function(a){return[{regex:/^[^*\/]+/,tag:"comment"},{regex:/^\*\//,tag:"comment",then:a},{regex:/^[*\/]/,tag:"comment"}]};c={start:[{regex:/^([a-zA-Z-\s]*)(?:\:)/,tag:"identifier",then:"style"},{regex:/^([\w]+)(?![a-zA-Z0-9_:])([,|{]*?)(?!;)(?!(;|%))/,tag:"keyword",then:"header"},{regex:/^#([a-zA-Z]*)(?=.*{*?)/,tag:"keyword",then:"header"},{regex:/^\.([a-zA-Z]*)(?=.*{*?)/,
tag:"keyword",then:"header"},c,{regex:/^\/\*/,tag:"comment",then:"comment"},{regex:/^./,tag:"plain"}],header:[{regex:/^[^{|\/\/|\/\*]*/,tag:"keyword",then:"start"},c,{regex:/^\/\*/,tag:"comment",then:"comment_header"}],style:[{regex:/^[^;|}|\/\/|\/\*]+/,tag:"plain"},{regex:/^;|}/,tag:"plain",then:"start"},c,{regex:/^\/\*/,tag:"comment",then:"comment_style"}],comment:d("start"),comment_header:d("header"),comment_style:d("style")};e.CSSSyntax=new b(c)});bespin.tiki.register("::html",{name:"html",dependencies:{standard_syntax:"0.0.0"}});
bespin.tiki.module("html:index",function(b,e){b=b("standard_syntax").StandardSyntax;var c={},d=function(a,f){c[a+"_beforeAttrName"]=[{regex:/^\s+/,tag:"plain"},{regex:/^\//,tag:"operator",then:a+"_selfClosingStartTag"},{regex:/^>/,tag:"operator",then:f},{regex:/^./,tag:"keyword",then:a+"_attrName"}];c[a+"_attrName"]=[{regex:/^\s+/,tag:"plain",then:a+"_afterAttrName"},{regex:/^\//,tag:"operator",then:a+"_selfClosingStartTag"},{regex:/^=/,tag:"operator",then:a+"_beforeAttrValue"},{regex:/^>/,tag:"operator",
then:f},{regex:/^["'<]+/,tag:"error"},{regex:/^[^ \t\n\/=>"'<]+/,tag:"keyword"}];c[a+"_afterAttrName"]=[{regex:/^\s+/,tag:"plain"},{regex:/^\//,tag:"operator",then:a+"_selfClosingStartTag"},{regex:/^=/,tag:"operator",then:a+"_beforeAttrValue"},{regex:/^>/,tag:"operator",then:f},{regex:/^./,tag:"keyword",then:a+"_attrName"}];c[a+"_beforeAttrValue"]=[{regex:/^\s+/,tag:"plain"},{regex:/^"/,tag:"string",then:a+"_attrValueQQ"},{regex:/^(?=&)/,tag:"plain",then:a+"_attrValueU"},{regex:/^'/,tag:"string",
then:a+"_attrValueQ"},{regex:/^>/,tag:"error",then:f},{regex:/^./,tag:"string",then:a+"_attrValueU"}];c[a+"_attrValueQQ"]=[{regex:/^"/,tag:"string",then:a+"_afterAttrValueQ"},{regex:/^[^"]+/,tag:"string"}];c[a+"_attrValueQ"]=[{regex:/^'/,tag:"string",then:a+"_afterAttrValueQ"},{regex:/^[^']+/,tag:"string"}];c[a+"_attrValueU"]=[{regex:/^\s/,tag:"string",then:a+"_beforeAttrName"},{regex:/^>/,tag:"operator",then:f},{regex:/[^ \t\n>]+/,tag:"string"}];c[a+"_afterAttrValueQ"]=[{regex:/^\s/,tag:"plain",
then:a+"_beforeAttrName"},{regex:/^\//,tag:"operator",then:a+"_selfClosingStartTag"},{regex:/^>/,tag:"operator",then:f},{regex:/^(?=.)/,tag:"operator",then:a+"_beforeAttrName"}];c[a+"_selfClosingStartTag"]=[{regex:/^>/,tag:"operator",then:"start"},{regex:/^./,tag:"error",then:a+"_beforeAttrName"}]};c={start:[{regex:/^[^<]+/,tag:"plain"},{regex:/^<!--/,tag:"comment",then:"commentStart"},{regex:/^<!/,tag:"directive",then:"markupDeclarationOpen"},{regex:/^<\?/,tag:"comment",then:"bogusComment"},{regex:/^</,
tag:"operator",then:"tagOpen"}],tagOpen:[{regex:/^\//,tag:"operator",then:"endTagOpen"},{regex:/^script/i,tag:"keyword",then:"script_beforeAttrName"},{regex:/^[a-zA-Z]/,tag:"keyword",then:"tagName"},{regex:/^(?=.)/,tag:"plain",then:"start"}],scriptData:[{regex:/^<(?=\/script>)/i,tag:"operator",then:"tagOpen"},{regex:/^[^<]+/,tag:"plain"}],endTagOpen:[{regex:/^[a-zA-Z]/,tag:"keyword",then:"tagName"},{regex:/^>/,tag:"error",then:"start"},{regex:/^./,tag:"error",then:"bogusComment"}],tagName:[{regex:/^\s+/,
tag:"plain",then:"normal_beforeAttrName"},{regex:/^\//,tag:"operator",then:"normal_selfClosingStartTag"},{regex:/^>/,tag:"operator",then:"start"},{regex:/^[^ \t\n\/>]+/,tag:"keyword"}],bogusComment:[{regex:/^[^>]+/,tag:"comment"},{regex:/^>/,tag:"comment",then:"start"}],markupDeclarationOpen:[{regex:/^doctype/i,tag:"directive",then:"doctype"},{regex:/^(?=.)/,tag:"comment",then:"bogusComment"}],commentStart:[{regex:/^--\>/,tag:"comment",then:"start"},{regex:/^[^-]+/,tag:"comment"}],doctype:[{regex:/^\s/,
tag:"plain",then:"beforeDoctypeName"},{regex:/^./,tag:"error",then:"beforeDoctypeName"}],beforeDoctypeName:[{regex:/^\s+/,tag:"plain"},{regex:/^>/,tag:"error",then:"start"},{regex:/^./,tag:"directive",then:"doctypeName"}],doctypeName:[{regex:/^\s/,tag:"plain",then:"afterDoctypeName"},{regex:/^>/,tag:"directive",then:"start"},{regex:/^[^ \t\n>]+/,tag:"directive"}],afterDoctypeName:[{regex:/^\s+/,tag:"directive"},{regex:/^>/,tag:"directive",then:"start"},{regex:/^public/i,tag:"directive",then:"afterDoctypePublicKeyword"},
{regex:/^system/i,tag:"directive",then:"afterDoctypeSystemKeyword"},{regex:/^./,tag:"error",then:"bogusDoctype"}],afterDoctypePublicKeyword:[{regex:/^\s+/,tag:"plain",then:"beforeDoctypePublicId"},{regex:/^"/,tag:"error",then:"doctypePublicIdQQ"},{regex:/^'/,tag:"error",then:"doctypePublicIdQ"},{regex:/^>/,tag:"error",then:"start"},{regex:/^./,tag:"error",then:"bogusDoctype"}],beforeDoctypePublicId:[{regex:/^\s+/,tag:"plain"},{regex:/^"/,tag:"string",then:"doctypePublicIdQQ"},{regex:/^'/,tag:"string",
then:"doctypePublicIdQ"},{regex:/^>/,tag:"error",then:"start"},{regex:/^./,tag:"error",then:"bogusDoctype"}],doctypePublicIdQQ:[{regex:/^"/,tag:"string",then:"afterDoctypePublicId"},{regex:/^>/,tag:"error",then:"start"},{regex:/^[^>"]+/,tag:"string"}],doctypePublicIdQ:[{regex:/^'/,tag:"string",then:"afterDoctypePublicId"},{regex:/^>/,tag:"error",then:"start"},{regex:/^[^>']+/,tag:"string"}],afterDoctypePublicId:[{regex:/^\s/,tag:"plain",then:"betweenDoctypePublicAndSystemIds"},{regex:/^>/,tag:"directive",
then:"start"},{regex:/^"/,tag:"error",then:"doctypeSystemIdQQ"},{regex:/^'/,tag:"error",then:"doctypeSystemIdQ"},{regex:/^./,tag:"error",then:"bogusDoctype"}],betweenDoctypePublicAndSystemIds:[{regex:/^\s+/,tag:"plain",then:"betweenDoctypePublicAndSystemIds"},{regex:/^>/,tag:"directive",then:"start"},{regex:/^"/,tag:"string",then:"doctypeSystemIdQQ"},{regex:/^'/,tag:"string",then:"doctypeSystemIdQ"},{regex:/^./,tag:"error",then:"bogusDoctype"}],afterDoctypeSystemKeyword:[{regex:/^\s/,tag:"plain",
then:"beforeDoctypeSystemId"},{regex:/^"/,tag:"error",then:"doctypeSystemIdQQ"},{regex:/^'/,tag:"error",then:"doctypeSystemIdQ"},{regex:/^>/,tag:"error",then:"start"},{regex:/^./,tag:"error",then:"bogusDoctype"}],beforeDoctypeSystemId:[{regex:/^\s+/,tag:"plain",then:"beforeDoctypeSystemId"},{regex:/^"/,tag:"string",then:"doctypeSystemIdQQ"},{regex:/^'/,tag:"string",then:"doctypeSystemIdQ"},{regex:/^>/,tag:"error",then:"start"},{regex:/./,tag:"error",then:"bogusDoctype"}],doctypeSystemIdQQ:[{regex:/^"/,
tag:"string",then:"afterDoctypeSystemId"},{regex:/^>/,tag:"error",then:"start"},{regex:/^[^">]+/,tag:"string"}],doctypeSystemIdQ:[{regex:/^'/,tag:"string",then:"afterDoctypeSystemId"},{regex:/^>/,tag:"error",then:"start"},{regex:/^[^'>]+/,tag:"string"}],afterDoctypeSystemId:[{regex:/^\s+/,tag:"plain"},{regex:/^>/,tag:"directive",then:"start"},{regex:/^./,tag:"error",then:"bogusDoctype"}],bogusDoctype:[{regex:/^>/,tag:"directive",then:"start"},{regex:/^[^>]+/,tag:"directive"}]};d("normal","start");
d("script","start js:start:<\/script>");e.HTMLSyntax=new b(c,["js"])});bespin.tiki.register("::js_syntax",{name:"js_syntax",dependencies:{standard_syntax:"0.0.0"}});
bespin.tiki.module("js_syntax:index",function(b,e){b=b("standard_syntax").StandardSyntax;e.JSSyntax=new b({start:[{regex:/^var(?=\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*require\s*\(\s*['"]([^'"]*)['"]\s*\)\s*[;,])/,tag:"keyword",symbol:"$1:$2"},{regex:/^(?:break|case|catch|continue|default|delete|do|else|false|finally|for|function|if|in|instanceof|let|new|null|return|switch|this|throw|true|try|typeof|var|void|while|with)(?![a-zA-Z0-9_])/,tag:"keyword"},{regex:/^[A-Za-z_][A-Za-z0-9_]*/,tag:"plain"},{regex:/^[^'"\/ \tA-Za-z0-9_]+/,
tag:"plain"},{regex:/^[ \t]+/,tag:"plain"},{regex:/^'(?=.)/,tag:"string",then:"qstring"},{regex:/^"(?=.)/,tag:"string",then:"qqstring"},{regex:/^\/\/.*/,tag:"comment"},{regex:/^\/\*/,tag:"comment",then:"comment"},{regex:/^./,tag:"plain"}],qstring:[{regex:/^(?:\\.|[^'\\])*'?/,tag:"string",then:"start"}],qqstring:[{regex:/^(?:\\.|[^"\\])*"?/,tag:"string",then:"start"}],comment:[{regex:/^[^*\/]+/,tag:"comment"},{regex:/^\*\//,tag:"comment",then:"start"},{regex:/^[*\/]/,tag:"comment"}]})});
bespin.tiki.register("::standard_syntax",{name:"standard_syntax",dependencies:{syntax_worker:"0.0.0",syntax_directory:"0.0.0",underscore:"0.0.0"}});
bespin.tiki.module("standard_syntax:index",function(b,e){b("bespin:promise");var c=b("underscore")._;b("bespin:console");b("syntax_directory");e.StandardSyntax=function(d,a){this.states=d;this.subsyntaxes=a};e.StandardSyntax.prototype={get:function(d,a,f){var m=d[0],n=d[1];if(!this.states.hasOwnProperty(n))throw new Error('StandardSyntax: no such state "'+n+'"');var o=a.substring(f),l={start:f,state:d},p=null;c(this.states[n]).each(function(j){var q=j.regex.exec(o);if(q!=null){var g=q[0].length;l.end=
f+g;l.tag=j.tag;var i=null;if(j.hasOwnProperty("symbol")){i=/^([^:]+):(.*)/.exec(j.symbol.replace(/\$([0-9]+)/g,function(t,k){return q[k]}));i=[i[1],i[2]]}var r=null;if(j.hasOwnProperty("then")){g=j.then.split(" ");j=[m,g[0]];if(g.length>1)r=g[1].split(":")}else if(g===0)throw new Error("StandardSyntax: Infinite loop detected: zero-length match that didn't change state");else j=d;p={state:j,token:l,symbol:i};if(r!=null)p.newContext=r;c.breakLoop()}});return p}}});
bespin.metadata={cs_syntax:{resourceURL:"resources/cs_syntax/",name:"cs_syntax",environments:{worker:true},dependencies:{standard_syntax:"0.0.0"},testmodules:[],provides:[{pointer:"#CSSyntax",ep:"syntax",fileexts:["cs"],name:"cs"}],type:"plugins\\thirdparty",description:"C# syntax highlighter"},sql_syntax:{resourceURL:"resources/sql_syntax/",name:"sql_syntax",environments:{worker:true},dependencies:{syntax_manager:"0.0.0"},testmodules:[],provides:[{pointer:"#SQLSyntax",ep:"syntax",fileexts:["sql"],
name:"sql"}],type:"plugins\\thirdparty",description:"Python syntax highlighter"},syntax_worker:{resourceURL:"resources/syntax_worker/",description:"Coordinates multiple syntax engines",environments:{worker:true},dependencies:{syntax_directory:"0.0.0",underscore:"0.0.0"},testmodules:[],type:"plugins\\supported",name:"syntax_worker"},stylesheet:{resourceURL:"resources/stylesheet/",name:"stylesheet",environments:{worker:true},dependencies:{standard_syntax:"0.0.0"},testmodules:[],provides:[{pointer:"#CSSSyntax",
ep:"syntax",fileexts:["css","less"],name:"css"}],type:"plugins\\supported",description:"CSS syntax highlighter"},html:{resourceURL:"resources/html/",name:"html",environments:{worker:true},dependencies:{standard_syntax:"0.0.0"},testmodules:[],provides:[{pointer:"#HTMLSyntax",ep:"syntax",fileexts:["htm","html"],name:"html"}],type:"plugins\\supported",description:"HTML syntax highlighter"},js_syntax:{resourceURL:"resources/js_syntax/",name:"js_syntax",environments:{worker:true},dependencies:{standard_syntax:"0.0.0"},
testmodules:[],provides:[{pointer:"#JSSyntax",ep:"syntax",fileexts:["js","json"],name:"js"}],type:"plugins\\supported",description:"JavaScript syntax highlighter"},standard_syntax:{resourceURL:"resources/standard_syntax/",description:"Easy-to-use basis for syntax engines",environments:{worker:true},dependencies:{syntax_worker:"0.0.0",syntax_directory:"0.0.0",underscore:"0.0.0"},testmodules:[],type:"plugins\\supported",name:"standard_syntax"}};
if(typeof window!=="undefined")throw new Error('"worker.js can only be loaded in a web worker. Use the "worker_manager" plugin to instantiate web workers.');var messageQueue=[],target=null;if(typeof bespin==="undefined")bespin={};
function pump(){if(messageQueue.length!==0){var b=messageQueue[0];switch(b.op){case "load":var e=b.base;bespin.base=e;bespin.hasOwnProperty("tiki")||importScripts(e+"tiki.js");if(!bespin.bootLoaded){importScripts(e+"plugin/register/boot");bespin.bootLoaded=true}var c=bespin.tiki.require;c.loader.sources[0].xhr=true;c.ensurePackage("::bespin",function(){var a=c("bespin:plugins").catalog,f=c("bespin:promise").Promise;if(bespin.hasOwnProperty("metadata")){a.registerMetadata(bespin.metadata);a=new f;
a.resolve()}else a=a.loadMetadataFromURL("plugin/register/worker");a.then(function(){c.ensurePackage(b.pkg,function(){target=c(b.module)[b.target];messageQueue.shift();pump()})})});break;case "invoke":e=function(a){postMessage(JSON.stringify({op:"finish",id:b.id,result:a}));messageQueue.shift();pump()};if(!target.hasOwnProperty(b.method))throw new Error("No such method: "+b.method);var d=target[b.method].apply(target,b.args);typeof d==="object"&&d.isPromise?d.then(e,function(a){throw a;}):e(d);break}}}
onmessage=function(b){messageQueue.push(JSON.parse(b.data));messageQueue.length===1&&pump()};
