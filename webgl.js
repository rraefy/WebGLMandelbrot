(function() {
    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext("experimental-webgl");
    var program = gl.createProgram();

    for (i in el = {vertex: gl.VERTEX_SHADER, fragment: gl.FRAGMENT_SHADER}) {
        var shader = gl.createShader(el[i]);
        gl.shaderSource(shader, document.getElementById(i).text);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
            throw i.id + ": " + gl.getShaderInfoLog(shader);
        gl.attachShader(program, shader);
    }
    
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw ("program:" + gl.getProgramInfoLog (program));

    gl.useProgram(program);

    var a_position = gl.getAttribLocation(program, "a_position");
    var u_offset = gl.getUniformLocation(program, "u_offset");
    var u_scale = gl.getUniformLocation(program, "u_scale");
    var u_iterations = gl.getUniformLocation(program, "u_iterations");

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

    var dpr = window.devicePixelRatio || 1;
    var ppu = 400;
    var center = [0, 0];
    var iterations = 100;
    
    canvas.onmousemove = function() {
        if (event.buttons & 1) {
            center[0] -= event.movementX / ppu * dpr;
            center[1] += event.movementY / ppu * dpr;
            render();
        }
    };

    canvas.onwheel = function() {
        ppu *= Math.pow(2, event.deltaY / -200);
        render();
    };
    
    window.onload = window.onresize = function() {
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
        render();
    };
    
    window.onkeypress = function() {
        var ratio = 0;
        if (event.charCode == 61) ratio = 1.04;
        else if (event.charCode == 45) ratio = 1/1.04;
        if (ratio) {
            iterations = Math.max(2, Math.min(iterations * ratio, 1000));
            render();
        }
    }
    
    function render() {
        window.cancelAnimationFrame(render.requestId);
        gl.uniform2f(u_offset, center[0] - canvas.width / 2 / ppu, center[1] - canvas.height / 2 / ppu);
        gl.uniform1f(u_scale, 1 / ppu);
        gl.uniform1i(u_iterations, iterations);
        render.requestId = window.requestAnimationFrame(function() {
             gl.drawArrays(gl.TRIANGLES, 0, 6);
        });
    }
})();
