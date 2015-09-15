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
    var u_center = gl.getUniformLocation(program, "u_center");
    var u_span = gl.getUniformLocation(program, "u_span");
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

    window.onload = window.onresize = function() {
        var dpr = window.devicePixelRatio || 1;
        canvas.width = canvas.clientWidth * dpr;
        canvas.height = canvas.clientHeight * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);

        var center = [-.5, 0];
        var scale = 1 / 3;
    
        gl.uniform2f(u_center, center[0] - .5 / scale, center[1] - .5 / scale);
        gl.uniform2fv(u_span, [canvas.width * scale, canvas.height * scale]);
        gl.uniform1i(u_iterations, 100);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
})();