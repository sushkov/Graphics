//----------------------------------
//common
function ge(id, node){
    if(node != null){
        return node.document.getElementById(id);
    } else {
        return document.getElementById(id);
    }
}

function ce(t_name, parnt, svg){
    if(svg) 
        elem = document.createElementNS ? document.createElementNS("http://www.w3.org/2000/svg", t_name) : document.createElement(t_name);
    else
        elem = document.createElement(t_name);
    if(parnt != null){
        parnt.appendChild(elem);
    }
    return elem;
}

function sa(elem, attr){
    for(var i in attr){
        if(i == "style"){
            var st_str = "", st_obj = attr[i];
            for(var k in st_obj){
                st_str = st_str + k + ": " + st_obj[k] + "; ";    
            }
            elem.setAttribute(i, st_str);
        } else {
            elem.setAttribute(i, attr[i]);
        }
    }
}
function DialogViewer(){
    var viewer = null;
    //viewer.onwheel = function(e){
        //stopBubble(e);
    //    return false;
    //}
    return{
        init: function(element){
            if(element != null) viewer = element;
        },
        hide: function(){
            if(viewer.style.display != "none")
                viewer.style.display = "none";
        },
        display: function(){
            if(viewer.style.display != "block")
                viewer.style.display = "block";
        }
    }
}

function Dialog(){
    var view = null, error_box= null, ok_btn = null, cancel_btn = null, close_btn = null, close = null, head = null;
    return{
        init: function(viewer, h, ok_b, cancel_b, close_b, errors){
            view = viewer;
            ok_btn = ge(ok_b);
            cancel_btn = ge(cancel_b);
            close_btn = ge(close_b);
            close_btn.onclick = close;
            head = ge(h);
            if(errors != null){
                error_box = ge(errors);
                error_box.style.display = "none";
            }
        },
        setDialogInfo: function(info){
            if(info != null){
                if(info.title != null) head.innerHTML = info.title; else head.innerHTML = "";
                if(info.ok != null) ok_btn.innerHTML = info.ok; else ok_btn.innerHTML = "Ok";
                if(info.cancel != null) cancel_btn.innerHTML = info.cancel; else cancel_btn.innerHTML = "Cancel";
            }
        },
        show: function(){
            view.display();
        },
        error: function(text){
            error_box.innerHTML += "<br>"+text+"<br><br>";
            error_box.style.display = "block";
            setTimeout(function(){error_box.style.display = "none"; error_box.innerHTML = "";}, 3000);
        },
        close: function(){
            view.hide();
        },
        setHandlers: function(ok_click, cancel_click){
            if(ok_click != null){
                ok_btn.onclick = function(){
                    ok_click();
                }
            }
            if(cancel_click != null){
                close = function(){
                    view.hide();
                    cancel_click();
                }
                close_btn.onclick = close;
                if(cancel_btn != null)
                    cancel_btn.onclick = close;
            }
        }
    }
}
//-----------------------------------
//svg board
function Board(b_obj, size){
        var fix_value = {"x": size.width/2, "y": size.height/2};
        var svg = ce("svg", b_obj, true), ox = ce("line", svg, true), oy = ce("line", svg, true), grid = Array();
        sa(svg, {"id": "canva", "style": {"width": size.width+"px", "height": size.height+"px"}});
        sa(ox, {"class": "ords", 
                "x1": 0,"x2": size.width,"y1": fix_value["y"], "y2": fix_value["y"]});
        sa(oy, {"class": "ords",
                "x1": fix_value["x"],"x2": fix_value["x"],"y1": 0, "y2": size.height});
    var setGrid = function(st){
        if(st){
            grid = Array();
            //vertical
            for(var i = fix_value.x, j = fix_value.x; i <= size.width, j >= 0; i += 10, j -= 10){
                var rv = ce("line", null, true), lv = ce("line", null, true);
                sa(rv, {"class": "ords",
                        "x1": j,"x2": j, "y1": 0, "y2": size.height});
                sa(lv, {"class": "ords",
                        "x1": i,"x2": i, "y1": 0, "y2": size.height});
                grid.push(rv, lv);
                svg.insertBefore(rv, ox);
                svg.insertBefore(lv, ox);
            }
            //horizontal
            for(var i = fix_value.y, j = fix_value.y; i <= size.height, j >= 0; i += 10, j -= 10){
                var bh = ce("line", null, true), th = ce("line", null, true);
                sa(th, {"class": "ords",
                        "x1": 0,"x2": size.width, "y1": j, "y2": j});
                sa(bh, {"class": "ords",
                        "x1": 0,"x2": size.width, "y1": i, "y2": i});
                grid.push(th, bh);
                svg.insertBefore(th, ox);
                svg.insertBefore(bh, ox);
            }
        } else {
            for(var i in grid)
                svg.removeChild(grid[i]);
        }
    }
    return {dom: svg,
            fixCoords: function(x,y){
                        return [
                            x + fix_value["x"],
                            fix_value["y"] - y
                            ]
                },
           setGrid: setGrid
           }
}
//---------------------------------
//shapes
function Line(parms, svg){
    if(parms != null){
        var line = ce("line", svg.dom, true), point_1 = ce("circle", svg.dom, true); 
        var point_2 = ce("circle", svg.dom, true);
        sa(line,{"class": "line"});
        var coords = Array();
        for(var i in parms){
            coords.push(svg.fixCoords(parms[i][0], parms[i][1]));
        }
        sa(line, {"x1": coords[0][0], "y1": coords[0][1], "x2": coords[1][0], "y2": coords[1][1]});
        sa(point_1, {"cx": coords[0][0], "cy": coords[0][1], "r": 2, "fill": "rgb(0,0,0)"});
        sa(point_2, {"cx": coords[1][0], "cy": coords[1][1], "r": 2, "fill": "rgb(0,0,0)"});
    }
    return{
        destroy: function(){
            svg.dom.removeChild(line);
            svg.dom.removeChild(point_1);
            svg.dom.removeChild(point_2);
        }
    }
}
function Triangle(parms, svg){
    if(parms != null){
        var p_line = ce("polyline", svg.dom, true);
        sa(p_line, {"class": "triangle f_grey"});
        var points = "";
        for(var i in parms){
            var coords = svg.fixCoords(parms[i][0], parms[i][1]);
            points += coords[0]+","+coords[1]+" ";
        }
        sa(p_line, {"points": points});
    }
    return{
        destroy: function(){
            svg.dom.removeChild(p_line);
        },
        setStyle: function(st){
            sa(p_line, st);
        }
    }
}
//---------------------------------
//math
var Matrix = (function(){
    return{
        multiply: function(A, B){
            var a_r = A.length, a_c = A[0].length,
                b_r = B.length, b_c = B[0].length,
                C = [];
            if(a_c != b_r) 
                return false;
            for(var i = 0; i < a_r; i++)
                C[i] = [];
            for(var k = 0; k < b_c; k++){
                for(var i = 0; i < a_r; i++){
                    var sum = 0;
                    for(var j = 0; j < b_r; j++)
                        sum += A[i][j] * B[j][k];
                    C[i][k] = sum;
                }
            }
            return C;
        }
    }     
})();
function is_number(num){
    if(num == 0)
        return true;
    return res = (num/num) ? true : false;
}
//-----------------------------------
//labs
function Lab1(){
    var line = null, triangle_1 = null, triangle_2 = null, 
        dom = null, svg = null;
    return{
        init: function(ini_obj){
            dom = ini_obj;
            svg = new Board(ini_obj.board, {"width": 1130, 
                                            "height": 600});
            dom.settings.grid_cb.onchange = function(){
                if(this.checked){
                    svg.setGrid(true);
                } else {
                    svg.setGrid(false);
                }
            }
        },
        draw: function(shape){
            var points = [], k = 1;
            for(var i in dom[shape]){
                if(dom[shape][i].value == '' || !is_number(dom[shape][i].value)){
                    alert("Не правильно заданы координаты");
                    return false;
                }
                if((k % 2) == 1 || k == 1)
                    points[points.length] = Array();
                points[points.length-1].push(parseInt(dom[shape][i].value));
                k++;
            }
            if(points.length != 0){
                switch(shape){
                case 'line':
                    if(line != null)
                        line.destroy();
                    line = new Line(points, svg);
                    line.points = points;
                    break;
                case 'triangle':
                    for(var i in points)
                        points[i].push(1);
                    if(triangle_1 != null)
                        triangle_1.destroy();
                    triangle_1 = new Triangle(points, svg)
                    triangle_1.points = points;
                    break;
                }
            }
        },
        mirror: function(){
            if(line != null && triangle_1 != null){
                if(triangle_2 != null)
                    triangle_2.destroy();
                var p1 = line.points[0], p2 = line.points[1], a = Math.atan((p2[1]-p1[1])/(p2[0]-p1[0]));
                var CBA = Matrix.multiply(triangle_1.points,[[1,0,0],
                                           [0,1,0],
                                           [-p1[0],-p1[1],1]]);
                CBA = Matrix.multiply(CBA,[[Math.cos(-a),Math.sin(-a),0],
                                       [-Math.sin(-a),Math.cos(-a),0],
                                       [0,0,1]]);
                CBA = Matrix.multiply(CBA,[[1,0,0],
                                       [0,-1,0],
                                       [0,0,1]]);
                CBA = Matrix.multiply(CBA,[[Math.cos(a),Math.sin(a),0],
                                       [-Math.sin(a),Math.cos(a),0],
                                       [0,0,1]]);
                CBA = Matrix.multiply(CBA,[[1,0,0],
                                           [0,1,0],
                                           [p1[0],p1[1],1]]);
                triangle_2 = new Triangle(CBA, svg);
                triangle_2.setStyle({"class": "triangle f_red"});
            } else 
                alert("Требуется нарисовать треугольник и прямую");
        }
    }
}
//---
function random(min, max){
    return Math.random() * (max - min) + min;
}
function Lab21(){
    var dom = null, 
        points = [],
        line_curve = null,
        spline_curve = null,
        scene = new THREE.Scene(),
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000 ),
        renderer = new THREE.WebGLRenderer(),
        coords_inp = [];
   var drawPolyLine = function(rand){
            var n = dom.n_input.value;
            if(n == '' || !is_number(n)){
                alert("Не правильно заданы координаты");
                return false;
            }
            if(n <= 1){
                alert("Число точек должно быть: 2 ... 1000");
                return false;
            }
            if(line_curve != null)
                scene.remove(line_curve);
            if(rand){
                if(points.length > 0){
                    points.length = 0;
                }
                for(var i = 1; i <= n; i++){
                    points.push(new THREE.Vector3(random(-200,200), 
                                      random(-200,200),
                                      random(-200,200)));
                }
            }
            var geometry = new THREE.Geometry();
            geometry.vertices = points;
            var material = new THREE.LineBasicMaterial({color: 0x0000ff});
            
            line_curve = new THREE.Line(geometry, material);
            scene.add(line_curve);
            renderer.render(scene, camera);
        };
    return{
        init: function(ini_obj){
            dom = ini_obj;
            renderer.setSize(1130, 600);
            renderer.setClearColor("#EEEEEE");
            dom.board.appendChild( renderer.domElement );

            var axes = new THREE.AxisHelper(250);
            scene.add(axes);
 
            camera.position.x = 50;
            camera.position.y = 40;
            camera.position.z = 150;
            //camera.lookAt(scene.position);
            var hex  = 0xff0000;

            var bmat = new THREE.MeshNormalMaterial( {color: 0x00ff00} );
            var box = new THREE.Mesh( new THREE.BoxGeometry( 500, 500, 500), bmat);
            scene.add(box);

            var bbox = new THREE.BoundingBoxHelper(box, hex);
            bbox.update();
            scene.add( bbox );

            var size = 250;
            var step = 10;

            var gridHelper = new THREE.GridHelper(size,step );        
            scene.add(gridHelper);
            renderer.render(scene, camera);

            var keyPress = function(e){
                switch(e.keyCode){
                case 119: //w
                    camera.position.z -= 1;
                    renderer.render(scene, camera);
                    break;
                case 122: //z
                    camera.position.y -= 1;
                    renderer.render(scene, camera);
                    break;
                case 120: //x
                    camera.position.y += 1;
                    renderer.render(scene, camera);
                    break;
                case 115: //s
                    camera.position.z += 1;
                    renderer.render(scene, camera);
                    break;
                case 97: //a
                    camera.position.x -= 1;
                    renderer.render(scene, camera);
                    break;
                case 100: //d
                    camera.position.x += 1;
                    renderer.render(scene, camera);
                    break;
                case 104: //h
                    camera.rotation.y += 0.01;
                    renderer.render(scene, camera);
                    break;
                case 108: //l
                    camera.rotation.y -= 0.01;
                    renderer.render(scene, camera);
                    break;
                case 106: //j
                    camera.rotation.x -= 0.01;
                    renderer.render(scene, camera);
                    break;
                case 107: //k
                    camera.rotation.x += 0.01;
                    renderer.render(scene, camera);
                    break;
                }
            }
            window.addEventListener( "keypress" , keyPress, false);
        },
        drawPolyLine: drawPolyLine,
        drawSpline: function(){
            if(spline_curve != null)
                scene.remove(spline_curve);
            var curve = new THREE.SplineCurve3(points);
            var geometry = new THREE.Geometry();
            geometry.vertices = curve.getPoints(1000);

            var material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
            spline_curve = new THREE.Line(geometry, material);
            scene.add(spline_curve);
            renderer.render(scene, camera);
        },
        edit: function(){
            if(points.length > 0){
                var prnt = ge("dialog_content");
                prnt.innerHTML = "";
                var tab = ce("table",prnt),
                    t_arr = {
                        0: "x",
                        1: "y",
                        2: "z"
                    };
                if(coords_inp.length > 0)
                    coords_inp.length = 0;
                for(var p in points){
                    var tr = ce("tr", tab),
                        t_inp_arr = [];
                        t_inp_arr.length = 0;
                    for(var i = 0; i < 3; i++){
                        var td = ce("td", tr),
                            inp = ce("input", td);
                        t_inp_arr.push(inp);
                        sa(inp, {"type": "text", "class": "tab_input"});
                        inp.value = points[p][t_arr[i]];
                    }
                    coords_inp.push(t_inp_arr);
                }
                dom.dialog.show();
            }
        },
        setCoords: function(){
            for(var i in coords_inp){
                points[i].setX(parseFloat(coords_inp[i][0].value));
                points[i].setY(parseFloat(coords_inp[i][1].value));
                points[i].setZ(parseFloat(coords_inp[i][2].value));
            }
            drawPolyLine(false);
        },
        rotateLineCurve: function(ord){
            var a = dom.a_input.value,
                pos = [];
            if(a == '' || !is_number(a)){
                alert("Не правильно задан угол");
                return false;
            }
            a = parseFloat(a);
            switch(ord){
            case 'ox':
            for(var i in points){
                var pt = [];
                pt.push(points[i].y);
                pt.push(points[i].z);
                pt.push(1);
                pos.push(pt);
            }
            var new_pos = Matrix.multiply(pos,[[Math.cos(a),Math.sin(a),0],
                                               [-Math.sin(a),Math.cos(a),0],
                                               [0,0,1]]);
            for(var i in points){
                points[i].setY(new_pos[i][0]);
                points[i].setZ(new_pos[i][1]);
            }
                break;
            case 'oy':
            for(var i in points){
                var pt = [];
                pt.push(points[i].x);
                pt.push(points[i].z);
                pt.push(1);
                pos.push(pt);
            }
            var new_pos = Matrix.multiply(pos,[[Math.cos(a),Math.sin(a),0],
                                               [-Math.sin(a),Math.cos(a),0],
                                               [0,0,1]]);
            for(var i in points){
                points[i].setX(new_pos[i][0]);
                points[i].setZ(new_pos[i][1]);
            }

                break; 
            }
            drawPolyLine(false);
        }
    }
}
function Lab2(){
    var dom = null, board = null,
        points = [], line_curve = null;
    return{
        init: function(ini_obj){
            dom = ini_obj;
            board = JXG.JSXGraph.initBoard("board", {boundingbox: [-100, 100, 100, -100],
                                                     axis: true});
        },
        drawPolyLine: function(){
            var n = dom.n_input.value;
            if(n == '' || !is_number(n)){
                alert("Не правильно заданы координаты");
                return false;
            }
            if(n <= 1){
                alert("Число точек должно быть: 2 ... 1000");
                return false;
            }
            if(points.length > 0){
                for(var i in points) points[i].remove();
                if(line_curve) line_curve.remove();
                points.length = 0;
            }
            for(var i = 1; i <= n; i++){
                points.push(board.create("point", 
                                        [random(-90,90),random(-90,90)], 
                                        {"strokecolor": "red", name: i})); 
            }
            line_curve = board.create("curve", 
                                      JXG.Math.Numerics.CardinalSpline(points, 0.0000000001), 
                                          {strokeWidth: 3});
        },
        drawSpline: function(){
        
        }
    }
}
function Lab5(){
    var dom = null, 
        shape_1 = null,
        shape_2 = null,
        plane = null,
        light = null,
        lighter = null,
        scene = new THREE.Scene(),
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000 ),
        renderer = new THREE.WebGLRenderer();
   var drawPolyLine = function(rand){
            var n = dom.n_input.value;
            if(n == '' || !is_number(n)){
                alert("Не правильно заданы координаты");
                return false;
            }
            if(n <= 1){
                alert("Число точек должно быть: 2 ... 1000");
                return false;
            }
            if(line_curve != null)
                scene.remove(line_curve);
            if(rand){
                if(points.length > 0){
                    points.length = 0;
                }
                for(var i = 1; i <= n; i++){
                    points.push(new THREE.Vector3(random(-200,200), 
                                      random(-200,200),
                                      random(-200,200)));
                }
            }
            var geometry = new THREE.Geometry();
            geometry.vertices = points;
            var material = new THREE.LineBasicMaterial({color: 0x0000ff});
            
            line_curve = new THREE.Line(geometry, material);
            scene.add(line_curve);
            renderer.render(scene, camera);
        };
    return{
        init: function(ini_obj){
            dom = ini_obj;
            renderer.setSize(1130, 600);
            renderer.setClearColorHex(0xEEEEEE, 1.0);
            renderer.shadowMapEnabled = true;
            dom.board.appendChild( renderer.domElement );

            var axes = new THREE.AxisHelper(250);
            scene.add(axes);
            
            camera.position.set(155,71,210);
            camera.rotation.set(-0.09,0.55,0);
            
            var hex  = 0xff0000;

            var bmat = new THREE.MeshNormalMaterial( {color: 0x00ff00} );
            var box = new THREE.Mesh( new THREE.BoxGeometry( 500, 500, 500), bmat);
            scene.add(box);

            var bbox = new THREE.BoundingBoxHelper(box, hex);
            bbox.update();
            scene.add( bbox );

            var size = 250;
            var step = 10;

            var gridHelper = new THREE.GridHelper(size,step );        
            scene.add(gridHelper);
            
            
            shape_1 = new THREE.Mesh(new THREE.CubeGeometry(20, 20, 20), new THREE.MeshLambertMaterial({color: 0xff0000}));
            shape_1.overdraw = true;
            shape_1.position.set(50,25,0);
            shape_1.castShadow = true;
            scene.add(shape_1);
            shape_2 = new THREE.Mesh(new THREE.CubeGeometry(30, 10, 10), new THREE.MeshLambertMaterial({color: 0x7777ff}));
            shape_2.overdraw = true;
            shape_2.position.set(50,25,0);
            shape_2.castShadow = true;
            scene.add(shape_2);

            plane = new THREE.Mesh(new THREE.PlaneGeometry(180,180,1,1),new THREE.MeshLambertMaterial({color: 0xffffff}));
            plane.position.set(50,1,0);
            plane.rotation.x=-0.5*Math.PI;
            plane.receiveShadow = true;
            scene.add(plane);
        
            light = new THREE.SpotLight(0xffffff);
            lighter = new THREE.Mesh(new THREE.SphereGeometry(4,20,20),new THREE.MeshBasicMaterial({color: 0x7777ff, wireframe: true}));
            light.position.set(50, 250, 0);
            light.castShadow = true;
            lighter.position.set(50, 250, 0);
            scene.add(light);
            scene.add(lighter);
           
           
            
            renderer.render(scene, camera);
            var counter = 0;
            setInterval(function(){
                shape_1.position.y += 0.2*Math.sin(counter);
                shape_2.position.y += 0.1*Math.cos(counter);
                shape_1.position.x += 0.4*Math.cos(counter);
                shape_2.position.z += 0.4*Math.cos(counter);
                counter += 0.01;
                renderer.render(scene, camera);                
            }, 10);

            var keyPress = function(e){
                console.log(camera);
                switch(e.keyCode){
                case 49: //1
                    light.position.z -= 1;
                    lighter.position.z -= 1;
                    renderer.render(scene, camera);
                    break;
                case 53: //5
                    light.position.y -= 1;
                    lighter.position.y -= 1;
                    renderer.render(scene, camera);
                    break;
                case 54: //6
                    light.position.y += 1;
                    lighter.position.y += 1;
                    renderer.render(scene, camera);
                    break;
                case 50: //2
                    light.position.z += 1;
                    lighter.position.z += 1;
                    renderer.render(scene, camera);
                    break;
                case 51: //3
                    light.position.x -= 1;
                    lighter.position.x -= 1;
                    renderer.render(scene, camera);
                    break;
                case 52: //4
                    light.position.x += 1;
                    lighter.position.x += 1;
                    renderer.render(scene, camera);
                    break;              
                case 119: //w
                    camera.position.z -= 1;
                    renderer.render(scene, camera);
                    break;
                case 122: //z
                    camera.position.y -= 1;
                    renderer.render(scene, camera);
                    break;
                case 120: //x
                    camera.position.y += 1;
                    renderer.render(scene, camera);
                    break;
                case 115: //s
                    camera.position.z += 1;
                    renderer.render(scene, camera);
                    break;
                case 97: //a
                    camera.position.x -= 1;
                    renderer.render(scene, camera);
                    break;
                case 100: //d
                    camera.position.x += 1;
                    renderer.render(scene, camera);
                    break;
                case 104: //h
                    camera.rotation.y += 0.01;
                    renderer.render(scene, camera);
                    break;
                case 108: //l
                    camera.rotation.y -= 0.01;
                    renderer.render(scene, camera);
                    break;
                case 106: //j
                    camera.rotation.x -= 0.01;
                    renderer.render(scene, camera);
                    break;
                case 107: //k
                    camera.rotation.x += 0.01;
                    renderer.render(scene, camera);
                    break;
                }
            }
            window.addEventListener( "keypress" , keyPress, false);
        },
        drawPolyLine: drawPolyLine,
    }
}
