(function() {
    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext("experimental-webgl");
    var program = gl.createProgram();

    [ { id: "vertex"  , type: gl.VERTEX_SHADER   },
      { id: "fragment", type: gl.FRAGMENT_SHADER } ].forEach(i => {
        var shader = gl.createShader(i.type);
        gl.shaderSource(shader, document.getElementById(i.id).text);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
            throw i.id + ": " + gl.getShaderInfoLog(shader);
        gl.attachShader(program, shader);
    })

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
    
    canvas.onmousemove = () => {
        if (event.buttons & 1) {
            center[0] -= event.movementX / ppu * dpr;
            center[1] += event.movementY / ppu * dpr;
            render();
        }
    }

    canvas.onwheel = () => {
        var clamp = (min, number, max) => Math.max(min, Math.min(number, max));
        iterations = clamp(2, iterations * Math.pow(2, event.deltaX / -200), 10000);
        ppu *= Math.pow(2, event.deltaY / -200);
        render();
    }
    
    window.onload = window.onresize = () => {
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
        render();
    };
    
    function render() {
        window.cancelAnimationFrame(render.requestId);
        gl.uniform2f(u_offset, center[0] - canvas.width / 2 / ppu, center[1] - canvas.height / 2 / ppu);
        gl.uniform1f(u_scale, 1 / ppu);
        gl.uniform1i(u_iterations, iterations);
        render.requestId = window.requestAnimationFrame(() => gl.drawArrays(gl.TRIANGLES, 0, 6));
    }
})();