{
    let config = {
        "random": {
            "value": function () {
                return Math.random();
            },
            "item": function (e) {
                let rand = e.length * config.random.value();
                return e[Math.floor(rand)];
            },
            "int": function (min, max) {
                return Math.floor(min + (max - min + 1) * config.random.value());
            },
            "float": function (min, max) {
                return min + (max - min) * config.random.value();
            },
            "bool": function () {
                return Math.random() > 0.5;
            },
            "color": function () {
                return [
                    config.random.float(0, 1),
                    config.random.float(0, 1),
                    config.random.float(0, 1),
                    config.random.float(0, 1)
                ];
            },
            "powerOfTwo": function (min, max) {
                let pow = Math.floor(Math.log2(min)) + Math.floor(config.random.value() * (Math.floor(Math.log2(max)) - Math.floor(Math.log2(min)) + 1));
                return Math.pow(2, pow);
            },
            "noise": function (value, range) {
                return value + (config.random.float(-range, range) * value);
            }
        },
        "sessionStorage": {
            "getOrSet": function (key, generator) {
                let value = sessionStorage.getItem(key);
                if (value === null) {
                    value = JSON.stringify(generator());
                    sessionStorage.setItem(key, value);
                }
                return JSON.parse(value);
            }
        },
        "spoof": {
            "webgl": {
                "buffer": function (target) {
                    let proto = target.prototype ? target.prototype : target.__proto__;

                    proto.bufferData = new Proxy(proto.bufferData, {
                        apply(target, self, args) {
                            if (args[1] instanceof ArrayBuffer || ArrayBuffer.isView(args[1])) {
                                let data;
                                if (args[1] instanceof Float32Array) {
                                    data = new Float32Array(args[1]);
                                    let scaleFactor = config.sessionStorage.getOrSet('webglBufferScaleFactor', () =>
                                        1 + config.random.float(-0.0001, 0.0001)
                                    );
                                    for (let i = 0; i < data.length; i++) {
                                        data[i] *= scaleFactor;
                                    }
                                } else if (args[1] instanceof Uint8Array || args[1] instanceof Uint16Array || args[1] instanceof Uint32Array) {
                                    data = new Uint8Array(args[1].buffer);
                                    let offset = config.sessionStorage.getOrSet('webglBufferOffset', () =>
                                        config.random.int(-1, 1)
                                    );
                                    for (let i = 0; i < data.length; i++) {
                                        data[i] = Math.max(0, Math.min(255, data[i] + offset));
                                    }
                                } else {
                                    data = args[1]; // For other types, keep original data
                                }
                                args[1] = data;
                            }
                            window.top.postMessage("webgl-defender-alert", '*');
                            return Reflect.apply(target, self, args);
                        }
                    });
                },
                "parameter": function (target) {
                    let proto = target.prototype ? target.prototype : target.__proto__;

                    proto.getParameter = new Proxy(proto.getParameter, {
                        apply(target, self, args) {
                            window.top.postMessage("webgl-defender-alert", '*');

                            switch (args[0]) {
                                // Cases that should return original values
                                case 7936: // VENDOR
                                case 7937: // VERSION
                                case 7938: // SHADING_LANGUAGE_VERSION
                                case 35724: // SHADING_LANGUAGE_VERSION (WebGL 2)
                                case 37445: // UNMASKED_VENDOR_WEBGL
                                case 37446: // UNMASKED_RENDERER_WEBGL
                                case 37447: // UNMASKED_VENDOR_WEBGL (WebGL 2)
                                    return Reflect.apply(target, self, args);

                                // WebGL 1 and 2 Parameters with realistic ranges
                                case 3379: return config.sessionStorage.getOrSet('MAX_TEXTURE_SIZE', () => config.random.powerOfTwo(8192, 16384));
                                case 3386: return config.sessionStorage.getOrSet('MAX_CUBE_MAP_TEXTURE_SIZE', () => config.random.powerOfTwo(8192, 16384));
                                case 3410: return config.sessionStorage.getOrSet('MAX_FRAGMENT_UNIFORM_VECTORS', () => config.random.int(512, 2048));
                                case 3411: return config.sessionStorage.getOrSet('MAX_VARYING_VECTORS', () => config.random.int(8, 32));
                                case 3412: return config.sessionStorage.getOrSet('MAX_VERTEX_UNIFORM_VECTORS', () => config.random.int(512, 2048));
                                case 3413: return config.sessionStorage.getOrSet('MAX_VERTEX_ATTRIBS', () => config.random.int(8, 32));
                                case 3414: return config.sessionStorage.getOrSet('DEPTH_BITS', () => config.random.item([16, 24, 32]));
                                case 3415: return config.sessionStorage.getOrSet('STENCIL_BITS', () => config.random.item([0, 8]));
                                case 33901: return config.sessionStorage.getOrSet('ALIASED_LINE_WIDTH_RANGE', () => new Float32Array([1, config.random.float(1, 8191)]));
                                case 33902: return config.sessionStorage.getOrSet('ALIASED_POINT_SIZE_RANGE', () => new Float32Array([1, config.random.float(1, 8191)]));
                                case 34024: return config.sessionStorage.getOrSet('MAX_TEXTURE_IMAGE_UNITS', () => config.random.int(8, 32));
                                case 34076: return config.sessionStorage.getOrSet('MAX_VIEWPORT_DIMS', () => new Int32Array([config.random.int(16384, 32767), config.random.int(16384, 32767)]));
                                case 34921: return config.sessionStorage.getOrSet('MAX_COMBINED_TEXTURE_IMAGE_UNITS', () => config.random.int(16, 48));
                                case 34930: return config.sessionStorage.getOrSet('MAX_VERTEX_TEXTURE_IMAGE_UNITS', () => config.random.int(4, 32));
                                case 35660: return config.sessionStorage.getOrSet('MAX_VERTEX_UNIFORM_COMPONENTS', () => config.random.int(2048, 8192));
                                case 35661: return config.sessionStorage.getOrSet('MAX_FRAGMENT_UNIFORM_COMPONENTS', () => config.random.int(2048, 8192));
                                case 36347: return config.sessionStorage.getOrSet('MAX_RENDERBUFFER_SIZE', () => config.random.powerOfTwo(8192, 16384));
                                case 36348: return config.sessionStorage.getOrSet('MAX_VERTEX_UNIFORM_BLOCKS', () => config.random.int(8, 16));
                                case 36349: return config.sessionStorage.getOrSet('MAX_VARYING_COMPONENTS', () => config.random.int(8, 32));
                                case 34047: return config.sessionStorage.getOrSet('MAX_COMBINED_TEXTURE_IMAGE_UNITS', () => config.random.int(16, 48));
                                case 34852: return config.sessionStorage.getOrSet('MAX_DRAW_BUFFERS', () => config.random.int(4, 16));
                                case 35071: return config.sessionStorage.getOrSet('MAX_SAMPLES', () => config.random.int(2, 8));
                                case 34045: return config.sessionStorage.getOrSet('MAX_COLOR_ATTACHMENTS', () => config.random.int(4, 16));
                                case 35658: return config.sessionStorage.getOrSet('MAX_VERTEX_OUTPUT_COMPONENTS', () => config.random.int(32, 128));
                                case 35659: return config.sessionStorage.getOrSet('MAX_FRAGMENT_INPUT_COMPONENTS', () => config.random.int(32, 128));
                                case 35968: return config.sessionStorage.getOrSet('MAX_ELEMENT_INDEX', () => config.random.int(Math.pow(2, 24), Math.pow(2, 32) - 1));
                                case 36063: return config.sessionStorage.getOrSet('MAX_UNIFORM_BUFFER_BINDINGS', () => config.random.int(24, 48));
                                case 36183: return config.sessionStorage.getOrSet('MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS', () => config.random.int(2, 8));
                                case 36204: return config.sessionStorage.getOrSet('MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS', () => config.random.int(32, 128));
                                case 3333: return config.sessionStorage.getOrSet('MAX_3D_TEXTURE_SIZE', () => config.random.powerOfTwo(1024, 4096));
                                case 32883: return config.sessionStorage.getOrSet('MAX_ELEMENTS_VERTICES', () => config.random.int(524288, 2097152));
                                case 32884: return config.sessionStorage.getOrSet('MAX_ELEMENTS_INDICES', () => config.random.int(524288, 2097152));
                                case 33000: return config.sessionStorage.getOrSet('MAX_SERVER_WAIT_TIMEOUT', () => config.random.int(0, 1000000));
                                case 35371: return config.sessionStorage.getOrSet('MAX_COMBINED_UNIFORM_BLOCKS', () => config.random.int(16, 32));
                                case 35375: return config.sessionStorage.getOrSet('MAX_UNIFORM_BUFFER_BINDINGS', () => config.random.int(24, 48));
                                case 35376: return config.sessionStorage.getOrSet('MAX_UNIFORM_BLOCK_SIZE', () => config.random.powerOfTwo(32768, 131072));
                                case 35377: return config.sessionStorage.getOrSet('MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS', () => config.random.int(24576, 49152));
                                case 35379: return config.sessionStorage.getOrSet('MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS', () => config.random.int(24576, 49152));
                                case 35657: return config.sessionStorage.getOrSet('MAX_FRAGMENT_UNIFORM_COMPONENTS', () => config.random.int(64, 256));
                                case 35658: return config.sessionStorage.getOrSet('MAX_VERTEX_UNIFORM_COMPONENTS', () => config.random.int(64, 256));
                                case 35659: return config.sessionStorage.getOrSet('MAX_VARYING_COMPONENTS', () => config.random.int(32, 128));
                                case 36318: return config.sessionStorage.getOrSet('MAX_UNIFORM_LOCATIONS', () => config.random.int(512, 2048));
                                case 36341: return config.sessionStorage.getOrSet('MAX_FRAGMENT_INPUT_COMPONENTS', () => config.random.int(32, 128));
                                case 36345: return config.sessionStorage.getOrSet('MAX_UNIFORM_LOCATIONS', () => config.random.int(512, 2048));
                                case 37154: return config.sessionStorage.getOrSet('MAX_COMBINED_SHADER_OUTPUT_RESOURCES', () => config.random.int(4, 16));

                                // State parameters
                                case 2884: return config.sessionStorage.getOrSet('CULL_FACE', () => config.random.bool());
                                case 2929: return config.sessionStorage.getOrSet('DEPTH_TEST', () => config.random.bool());
                                case 2960: return config.sessionStorage.getOrSet('SCISSOR_TEST', () => config.random.bool());
                                case 3042: return config.sessionStorage.getOrSet('BLEND', () => config.random.bool());
                                case 3089: return config.sessionStorage.getOrSet('SCISSOR_BOX', () => new Int32Array([0, 0, config.random.int(200, 400), config.random.int(100, 300)]));
                                case 2961: return config.sessionStorage.getOrSet('SCISSOR_BOX', () => new Int32Array([0, 0, config.random.int(200, 400), config.random.int(100, 300)]));
                                case 3088: return config.sessionStorage.getOrSet('SCISSOR_BOX', () => new Int32Array([0, 0, config.random.int(200, 400), config.random.int(100, 300)]));
                                case 2978: return config.sessionStorage.getOrSet('VIEWPORT', () => new Int32Array([0, 0, config.random.int(200, 400), config.random.int(100, 300)]));
                                case 32773: return config.sessionStorage.getOrSet('BLEND_EQUATION_RGB', () => config.random.item([32774, 32778, 32779]));
                                case 32777: return config.sessionStorage.getOrSet('BLEND_DST_RGB', () => config.random.item([0, 1, 768, 769, 774, 775, 776]));
                                case 32778: return config.sessionStorage.getOrSet('BLEND_SRC_ALPHA', () => config.random.item([0, 1, 768, 769, 774, 775, 776]));
                                case 32779: return config.sessionStorage.getOrSet('BLEND_DST_ALPHA', () => config.random.item([0, 1, 768, 769, 774, 775, 776]));
                                case 32968: return config.sessionStorage.getOrSet('BLEND_SRC_RGB', () => config.random.item([0, 1, 768, 769, 774, 775, 776]));
                                case 32969: return config.sessionStorage.getOrSet('BLEND_DST_RGB', () => config.random.item([0, 1, 768, 769, 774, 775, 776]));
                                case 32970: return config.sessionStorage.getOrSet('BLEND_SRC_ALPHA', () => config.random.item([0, 1, 768, 769, 774, 775, 776]));
                                case 32971: return config.sessionStorage.getOrSet('BLEND_DST_ALPHA', () => config.random.item([0, 1, 768, 769, 774, 775, 776]));
                                case 34816: return config.sessionStorage.getOrSet('BLEND_EQUATION_RGB', () => config.random.item([32774, 32778, 32779]));
                                case 34817: return config.sessionStorage.getOrSet('BLEND_EQUATION_ALPHA', () => config.random.item([32774, 32778, 32779]));
                                case 34877: return config.sessionStorage.getOrSet('DRAW_BUFFER0', () => config.random.int(0, 15));
                                case 3024: return config.sessionStorage.getOrSet('DITHER', () => config.random.bool());
                                case 2849: return config.sessionStorage.getOrSet('DEPTH_WRITEMASK', () => config.random.bool());
                                case 2886: return config.sessionStorage.getOrSet('POLYGON_OFFSET_FACTOR', () => config.random.float(0, 4));
                                case 2928: return config.sessionStorage.getOrSet('DEPTH_RANGE', () => new Float32Array([0, config.random.float(0, 1)]));
                                case 2930: return config.sessionStorage.getOrSet('DEPTH_CLEAR_VALUE', () => config.random.float(0, 1));
                                case 2931: return config.sessionStorage.getOrSet('DEPTH_FUNC', () => config.random.item([512, 513, 514, 515, 516, 517, 518]));
                                case 2932: return config.sessionStorage.getOrSet('STENCIL_CLEAR_VALUE', () => config.random.int(0, 255));
                                case 2962: return config.sessionStorage.getOrSet('SCISSOR_TEST', () => config.random.bool());
                                case 2963: return config.sessionStorage.getOrSet('STENCIL_VALUE_MASK', () => config.random.int(0, 255));
                                case 2964: return config.sessionStorage.getOrSet('STENCIL_FAIL', () => config.random.item([7680, 7681, 7682, 7683, 7684, 7685, 7686, 7687, 7688, 7689]));
                                case 2965: return config.sessionStorage.getOrSet('STENCIL_PASS_DEPTH_FAIL', () => config.random.item([7680, 7681, 7682, 7683, 7684, 7685, 7686, 7687, 7688, 7689]));
                                case 2966: return config.sessionStorage.getOrSet('STENCIL_PASS_DEPTH_PASS', () => config.random.item([7680, 7681, 7682, 7683, 7684, 7685, 7686, 7687, 7688, 7689]));
                                case 2967: return config.sessionStorage.getOrSet('STENCIL_FUNC', () => config.random.item([512, 513, 514, 515, 516, 517, 518, 519]));
                                case 2968: return config.sessionStorage.getOrSet('STENCIL_WRITEMASK', () => config.random.int(0, 255));
                                case 3106: return config.sessionStorage.getOrSet('UNPACK_ALIGNMENT', () => config.random.item([1, 2, 4, 8]));
                                case 3107: return config.sessionStorage.getOrSet('PACK_ALIGNMENT', () => config.random.item([1, 2, 4, 8]));
                                case 3317: return config.sessionStorage.getOrSet('UNPACK_FLIP_Y_WEBGL', () => config.random.bool());
                                case 3408: return config.sessionStorage.getOrSet('COLOR_CLEAR_VALUE', () => config.random.color());
                                case 10752: return config.sessionStorage.getOrSet('COLOR_WRITEMASK', () => [config.random.bool(), config.random.bool(), config.random.bool(), config.random.bool()]);
                                case 32824: return config.sessionStorage.getOrSet('UNPACK_PREMULTIPLY_ALPHA_WEBGL', () => config.random.bool());
                                case 32936: return config.sessionStorage.getOrSet('UNPACK_COLORSPACE_CONVERSION_WEBGL', () => config.random.bool());
                                case 32937: return config.sessionStorage.getOrSet('PACK_ALIGNMENT', () => config.random.item([1, 2, 4, 8]));
                                case 32938: return config.sessionStorage.getOrSet('PACK_REVERSE_ROW_ORDER_WEBGL', () => config.random.bool());
                                case 32939: return config.sessionStorage.getOrSet('UNPACK_ROW_LENGTH', () => config.random.int(0, 4096));
                                case 32940: return config.sessionStorage.getOrSet('UNPACK_SKIP_ROWS', () => config.random.int(0, 256));
                                case 32941: return config.sessionStorage.getOrSet('UNPACK_SKIP_PIXELS', () => config.random.int(0, 256));
                                case 32942: return config.sessionStorage.getOrSet('PACK_ROW_LENGTH', () => config.random.int(0, 4096));
                                case 32943: return config.sessionStorage.getOrSet('PACK_SKIP_ROWS', () => config.random.int(0, 256));
                                case 32944: return config.sessionStorage.getOrSet('PACK_SKIP_PIXELS', () => config.random.int(0, 256));
                                case 32945: return config.sessionStorage.getOrSet('UNPACK_SKIP_IMAGES', () => config.random.int(0, 256));
                                case 32946: return config.sessionStorage.getOrSet('UNPACK_IMAGE_HEIGHT', () => config.random.int(0, 4096));
                             /*   case 33170: return null; // FRAMEBUFFER_BINDING*/
                                case 33984: return config.sessionStorage.getOrSet('ACTIVE_TEXTURE', () => config.random.int(33984, 33999));
                         /*       case 34016: return null; // RENDERBUFFER_BINDING*/
                                case 34467: return config.sessionStorage.getOrSet('CONTEXT_LOST_WEBGL', () => config.random.bool());
                                case 35656: return config.sessionStorage.getOrSet('TRANSFORM_FEEDBACK_BUFFER_SIZE', () => config.random.int(128, 512));
                                //case 35738: return null; // TEXTURE_BINDING_2D
                                //case 35739: return null; // TEXTURE_BINDING_CUBE_MAP
                                case 36003: return config.sessionStorage.getOrSet('BLEND_SRC_ALPHA', () => config.random.item([0, 1, 768, 769, 774, 775, 776]));
                                case 36004: return config.sessionStorage.getOrSet('BLEND_DST_ALPHA', () => config.random.item([0, 1, 768, 769, 774, 775, 776]));
                                case 36005: return config.sessionStorage.getOrSet('BLEND_EQUATION_ALPHA', () => config.random.item([32774, 32778, 32779]));
                                case 36006: return config.sessionStorage.getOrSet('BLEND_SRC_ALPHA', () => config.random.item([0, 1, 768, 769, 774, 775, 776]));
                                case 36007: return config.sessionStorage.getOrSet('BLEND_DST_ALPHA', () => config.random.item([0, 1, 768, 769, 774, 775, 776]));
                        /*        case 36179: return null; // TEXTURE_BINDING_2D_ARRAY*/
                                case 36203: return config.sessionStorage.getOrSet('TRANSFORM_FEEDBACK_BUFFER_START', () => config.random.int(0, 1024));
                                //case 36288: return null; // COPY_READ_BUFFER_BINDING
                                //case 36289: return null; // COPY_WRITE_BUFFER_BINDING
                                case 36335: return config.sessionStorage.getOrSet('DEPTH_CLAMP', () => config.random.bool());
                        /*        case 36336: return null; // COLOR_BUFFER_FLOAT*/
                                case 36337: return config.sessionStorage.getOrSet('MAX_VERTEX_UNIFORM_VECTORS', () => config.random.int(4, 16));
                                case 36338: return config.sessionStorage.getOrSet('MAX_VARYING_VECTORS', () => config.random.int(4, 16));
                                case 36339: return config.sessionStorage.getOrSet('MAX_FRAGMENT_UNIFORM_VECTORS', () => config.random.int(4, 16));
                                case 36340: return config.sessionStorage.getOrSet('MAX_VERTEX_UNIFORM_COMPONENTS', () => config.random.int(16, 64));
                                case 36343: return config.sessionStorage.getOrSet('MAJOR_MINOR_VERSION', () => [config.random.int(1, 4), config.random.int(0, 9)]);
                                case 36346: return config.sessionStorage.getOrSet('SRGB_DECODE_EXT', () => [config.random.int(0, 1), config.random.int(0, 1)]);
                                //case 36350: return null; // TRANSFORM_FEEDBACK_BINDING
                                //case 36351: return null; // TRANSFORM_FEEDBACK_BUFFER_BINDING
                                //case 36386: return null; // PIXEL_PACK_BUFFER_BINDING
                                case 36392: return config.sessionStorage.getOrSet('COLOR_WRITEMASK', () => [config.random.bool(), config.random.bool(), config.random.bool(), config.random.bool()]);
                                //case 36662: return null; // PIXEL_UNPACK_BUFFER_BINDING
                                //case 36795: return null; // TRANSFORM_FEEDBACK_BINDING

                                default:
                           /*         console.warn("Unhandled WebGL parameter:", args[0]);*/
                                    return Reflect.apply(target, self, args);
                            }
                        }
                    });
                }
            }
        }
    };

    config.spoof.webgl.buffer(WebGLRenderingContext);
    config.spoof.webgl.buffer(WebGL2RenderingContext);
    config.spoof.webgl.parameter(WebGLRenderingContext);
    config.spoof.webgl.parameter(WebGL2RenderingContext);
}

{
    const mkey = "webgl-defender-sandboxed-frame";
    document.documentElement.setAttribute(mkey, '');

    window.addEventListener("message", function (e) {
        if (e.data && e.data === mkey) {
            e.preventDefault();
            e.stopPropagation();

            if (e.source) {
                if (e.source.WebGLRenderingContext) {
                    e.source.WebGLRenderingContext.prototype.bufferData = WebGLRenderingContext.prototype.bufferData;
                    e.source.WebGLRenderingContext.prototype.getParameter = WebGLRenderingContext.prototype.getParameter;
                }

                if (e.source.WebGL2RenderingContext) {
                    e.source.WebGL2RenderingContext.prototype.bufferData = WebGL2RenderingContext.prototype.bufferData;
                    e.source.WebGL2RenderingContext.prototype.getParameter = WebGL2RenderingContext.prototype.getParameter;
                }
            }
        }
    }, false);
}

//{
//    let config = {
//        "random": {
//            "value": function () {
//                return Math.random();
//            },
//            "item": function (e) {
//                let rand = e.length * config.random.value();
//                return e[Math.floor(rand)];
//            },
//            "number": function (power) {
//                let tmp = [];
//                for (let i = 0; i < power.length; i++) {
//                    tmp.push(Math.pow(2, power[i]));
//                }
//                return config.random.item(tmp);
//            },
//            "int": function (power) {
//                let tmp = [];
//                for (let i = 0; i < power.length; i++) {
//                    let n = Math.pow(2, power[i]);
//                    tmp.push(new Int32Array([n, n]));
//                }
//                return config.random.item(tmp);
//            },
//            "float": function (power) {
//                let tmp = [];
//                for (let i = 0; i < power.length; i++) {
//                    let n = Math.pow(2, power[i]);
//                    tmp.push(new Float32Array([1, n]));
//                }
//                return config.random.item(tmp);
//            },
//            "bool": function () {
//                return Math.random() > 0.5;
//            },
//            "bitmask": function (bits) {
//                return Math.floor(Math.random() * (1 << bits));
//            },
//            "color": function () {
//                return [Math.random(), Math.random(), Math.random(), Math.random()];
//            },
//            "blendFunc": function () {
//                const funcs = [0, 1, 0x0300, 0x0301, 0x0302, 0x0303, 0x0304, 0x0305, 0x0306, 0x0307, 0x0308, 0x8001, 0x8002, 0x8003, 0x8004];
//                return config.random.item(funcs);
//            },
//            "blendEquation": function () {
//                const equations = [0x8006, 0x8007, 0x8008, 0x800A, 0x800B];
//                return config.random.item(equations);
//            }
//        },
//        "spoof": {
//            "webgl": {
//                "buffer": function (target) {
//                    let proto = target.prototype ? target.prototype : target.__proto__;

//                    proto.bufferData = new Proxy(proto.bufferData, {
//                        apply(target, self, args) {
//                            if (args[1] instanceof ArrayBuffer || ArrayBuffer.isView(args[1])) {
//                                let data = new Float32Array(args[1]);
//                                for (let i = 0; i < data.length; i++) {
//                                    let noise = 0.0001 * config.random.value() * data[i];
//                                    data[i] += noise;
//                                }
//                                args[1] = data;
//                            }
//                            window.top.postMessage("webgl-defender-alert", '*');
//                            return Reflect.apply(target, self, args);
//                        }
//                    });
//                },
//                "parameter": function (target) {
//                    let proto = target.prototype ? target.prototype : target.__proto__;

//                    proto.getParameter = new Proxy(proto.getParameter, {
//                        apply(target, self, args) {
//                            window.top.postMessage("webgl-defender-alert", '*');

//                            switch (args[0]) {
//                                // Cases that should return original values
//                                case 7936: // VENDOR
//                                case 7937: // VERSION
//                                case 7938: // SHADING_LANGUAGE_VERSION
//                                case 35724: // SHADING_LANGUAGE_VERSION (WebGL 2)
//                                case 37445: // UNMASKED_VENDOR_WEBGL
//                                case 37446: // UNMASKED_RENDERER_WEBGL
//                                case 37447: // UNMASKED_VENDOR_WEBGL (WebGL 2)
//                                    return Reflect.apply(target, self, args);

//                                // WebGL 1 and 2 Parameters
//                                case 3379: return config.random.number([13, 14, 15]); // MAX_TEXTURE_SIZE
//                                case 3386: return config.random.number([13, 14, 15]); // MAX_CUBE_MAP_TEXTURE_SIZE
//                                case 3410: return config.random.number([9, 10, 11]); // MAX_FRAGMENT_UNIFORM_VECTORS
//                                case 3411: return config.random.item([16, 32, 64]); // MAX_VARYING_VECTORS
//                                case 3412: return config.random.number([11, 12, 13]); // MAX_VERTEX_UNIFORM_VECTORS
//                                case 3413: return config.random.item([8, 16, 32]); // MAX_VERTEX_ATTRIBS
//                                case 3414: return config.random.item([16, 24, 32]); // DEPTH_BITS
//                                case 3415: return config.random.item([0, 8]); // STENCIL_BITS
//                                case 33901: return config.random.float([9, 10, 11]); // ALIASED_LINE_WIDTH_RANGE
//                                case 33902: return config.random.float([9, 10, 11]); // ALIASED_POINT_SIZE_RANGE
//                                case 34024: return config.random.item([8, 16, 32]); // MAX_TEXTURE_IMAGE_UNITS
//                                case 34076: return config.random.int([13, 14, 15]); // MAX_VIEWPORT_DIMS
//                                case 34921: return config.random.item([8, 16, 32]); // MAX_COMBINED_TEXTURE_IMAGE_UNITS
//                                case 34930: return config.random.item([8, 16, 32]); // MAX_VERTEX_TEXTURE_IMAGE_UNITS
//                                case 35660: return config.random.number([11, 12, 13]); // MAX_VERTEX_UNIFORM_COMPONENTS
//                                case 35661: return config.random.number([11, 12, 13]); // MAX_FRAGMENT_UNIFORM_COMPONENTS
//                                case 36347: return config.random.number([13, 14, 15]); // MAX_RENDERBUFFER_SIZE
//                                case 36348: return config.random.item([8, 12, 16]); // MAX_VERTEX_UNIFORM_BLOCKS
//                                case 36349: return config.random.item([30, 60, 90]); // MAX_VARYING_COMPONENTS
//                                case 34047: return config.random.item([16, 32, 64]); // MAX_COMBINED_TEXTURE_IMAGE_UNITS
//                                case 34852: return config.random.item([8, 16, 32]); // MAX_DRAW_BUFFERS
//                                case 35071: return config.random.item([4, 8, 16]); // MAX_SAMPLES
//                                case 34045: return config.random.item([1, 2, 4]); // MAX_COLOR_ATTACHMENTS
//                                case 35658: return config.random.item([4, 8, 16]); // MAX_VERTEX_OUTPUT_COMPONENTS
//                                case 35659: return config.random.item([4, 8, 16]); // MAX_FRAGMENT_INPUT_COMPONENTS
//                                case 35968: return config.random.item([4096, 8192, 16384]); // MAX_ELEMENT_INDEX
//                                case 36063: return config.random.item([16, 32, 64]); // MAX_UNIFORM_BUFFER_BINDINGS
//                                case 36183: return config.random.item([1, 2, 4]); // MAX_TRANSFORM_FEEDBACK_SEPARATE_COMPONENTS
//                                case 36204: return config.random.item([1, 2, 4]); // MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS
//                                case 3333: return config.random.item([4, 8, 16]); // MAX_3D_TEXTURE_SIZE
//                                case 32883: return config.random.item([1, 2, 4]); // MAX_ELEMENTS_VERTICES
//                                case 32884: return config.random.item([1, 2, 4]); // MAX_ELEMENTS_INDICES
//                                case 33000: return config.random.item([16, 32, 64]); // MAX_SERVER_WAIT_TIMEOUT
//                                case 34030: return config.random.item([8, 16, 32]); // MAX_FRAGMENT_UNIFORM_COMPONENTS
//                                case 35371: return config.random.item([4, 8, 16]); // MAX_COMBINED_UNIFORM_BLOCKS
//                                case 35375: return config.random.item([16, 32, 64]); // MAX_UNIFORM_BUFFER_BINDINGS
//                                case 35376: return config.random.number([12, 13, 14]); // MAX_UNIFORM_BLOCK_SIZE
//                                case 35377: return config.random.item([4, 8, 16]); // MAX_COMBINED_VERTEX_UNIFORM_COMPONENTS
//                                case 35379: return config.random.item([4, 8, 16]); // MAX_COMBINED_FRAGMENT_UNIFORM_COMPONENTS
//                                case 35657: return config.random.item([4, 8, 16]); // MAX_FRAGMENT_UNIFORM_COMPONENTS
//                                case 35658: return config.random.item([4, 8, 16]); // MAX_VERTEX_UNIFORM_COMPONENTS
//                                case 35659: return config.random.item([4, 8, 16]); // MAX_VARYING_COMPONENTS
//                                case 36383: return config.random.item([4, 8, 16]); // MAX_VERTEX_UNIFORM_BLOCKS
//                                case 36201: return config.random.item([4, 8, 16]); // MAX_COMBINED_SHADER_OUTPUT_RESOURCES
//                                case 36318: return config.random.item([8, 16, 32]); // MAX_UNIFORM_LOCATIONS
//                                case 36341: return config.random.item([4, 8, 16]); // MAX_FRAGMENT_INPUT_COMPONENTS
//                                case 36345: return config.random.item([4, 8, 16]); // MAX_UNIFORM_LOCATIONS
//                                case 37154: return config.random.item([8, 16, 32]); // MAX_COMBINED_SHADER_OUTPUT_RESOURCES

//                                // Newly added parameters with spoofing
//                                case 32777: return config.random.blendFunc(); // BLEND_DST_RGB
//                                case 34877: return config.random.bitmask(4); // DRAW_BUFFER0
//                                case 32968: return config.random.blendFunc(); // BLEND_SRC_RGB
//                                case 32969: return config.random.blendFunc(); // BLEND_DST_RGB
//                                case 32970: return config.random.blendFunc(); // BLEND_SRC_ALPHA
//                                case 32971: return config.random.blendFunc(); // BLEND_DST_ALPHA
//                                case 32773: return config.random.blendEquation(); // BLEND_EQUATION_RGB
//                                case 2884: return config.random.bool(); // CULL_FACE
//                                case 3042: return config.random.bool(); // BLEND
//                                case 3024: return config.random.bool(); // DITHER
//                                case 2960: return config.random.bool(); // SCISSOR_TEST
//                                case 2929: return config.random.bool(); // DEPTH_TEST
//                                case 3089: return [0, 0, config.random.int([8, 9, 10]), config.random.int([8, 9, 10])]; // SCISSOR_BOX
//                                case 32823: return config.random.bool(); // UNPACK_FLIP_Y_WEBGL
//                                case 2849: return config.random.bool(); // DEPTH_WRITEMASK
//                                case 2885: return config.random.bool(); // POLYGON_OFFSET_FILL
//                                case 2886: return config.random.float([0, 1, 2]); // POLYGON_OFFSET_FACTOR
//                                case 2928: return [0, config.random.float([0, 1, 2])]; // DEPTH_RANGE
//                                case 2930: return config.random.float([0, 1]); // DEPTH_CLEAR_VALUE
//                                case 2931: return config.random.item([512, 513, 514, 515, 516, 517, 518]); // DEPTH_FUNC
//                                case 2932: return config.random.int([0, 1, 2, 3, 4]); // STENCIL_CLEAR_VALUE
//                                case 2962: return config.random.bool(); // SCISSOR_TEST
//                                case 2964: return config.random.item([7680, 7681, 7682, 7683, 7684, 7685, 7686, 7687, 7688, 7689]); // STENCIL_FAIL
//                                case 2965: return config.random.item([7680, 7681, 7682, 7683, 7684, 7685, 7686, 7687, 7688, 7689]); // STENCIL_PASS_DEPTH_FAIL
//                                case 2966: return config.random.item([7680, 7681, 7682, 7683, 7684, 7685, 7686, 7687, 7688, 7689]); // STENCIL_PASS_DEPTH_PASS
//                                case 2967: return config.random.item([512, 513, 514, 515, 516, 517, 518, 519]); // STENCIL_FUNC
//                                case 2963: return config.random.bitmask(8); // STENCIL_VALUE_MASK
//                                case 2968: return config.random.bitmask(8); // STENCIL_WRITEMASK
//                                case 34816: return config.random.blendEquation(); // BLEND_EQUATION_RGB
//                                case 34817: return config.random.blendEquation(); // BLEND_EQUATION_ALPHA
//                                case 34818: return config.random.blendFunc(); // BLEND_SRC_RGB
//                                case 34819: return config.random.blendFunc(); // BLEND_DST_RGB
//                                case 36003: return config.random.blendFunc(); // BLEND_SRC_ALPHA
//                                case 36004: return config.random.blendFunc(); // BLEND_DST_ALPHA
//                                case 36005: return config.random.blendEquation(); // BLEND_EQUATION_ALPHA
//                                case 2978: return [0, 0, config.random.int([8, 9, 10]), config.random.int([8, 9, 10])]; // VIEWPORT
//                                case 3106: return config.random.item([1, 2, 4, 8]); // UNPACK_ALIGNMENT
//                                case 3107: return config.random.item([1, 2, 4, 8]); // PACK_ALIGNMENT
//                                case 3317: return config.random.bool(); // UNPACK_FLIP_Y_WEBGL
//                                case 3408: return config.random.color(); // COLOR_CLEAR_VALUE
//                                case 10752: return [config.random.bool(), config.random.bool(), config.random.bool(), config.random.bool()]; // COLOR_WRITEMASK
//                                case 32824: return config.random.bool(); // UNPACK_PREMULTIPLY_ALPHA_WEBGL
//                                case 32936: return config.random.bool(); // UNPACK_COLORSPACE_CONVERSION_WEBGL
//                                case 32937: return config.random.item([1, 2, 4, 8]); // PACK_ALIGNMENT
//                                case 32938: return config.random.bool(); // PACK_REVERSE_ROW_ORDER_WEBGL
//                                case 32939: return config.random.item([0, 512, 1024, 2048]); // UNPACK_ROW_LENGTH
//                                case 34467: return config.random.bool(); // CONTEXT_LOST_WEBGL
//                                case 37440: return config.random.bool(); // UNPACK_FLIP_Y_WEBGL
//                                case 37441: return config.random.bool(); // UNPACK_PREMULTIPLY_ALPHA_WEBGL
//                                case 37443: return config.random.bool(); // UNPACK_COLORSPACE_CONVERSION_WEBGL
//                                case 35723: return config.random.item([4352, 4353]); // FRAGMENT_SHADER_DERIVATIVE_HINT
//                                case 34229: return config.random.bool(); // TRANSFORM_FEEDBACK_ACTIVE
//                                case 34853: return config.random.bool(); // RASTERIZER_DISCARD
//                                case 34854: return config.random.bool(); // TRANSFORM_FEEDBACK_PAUSED
//                                case 2961: // SCISSOR_BOX
//                                case 3088: // SCISSOR_BOX (duplicated in WebGL spec)
//                                    return [0, 0, config.random.int([8, 9, 10]), config.random.int([8, 9, 10])];
//                                case 36392: // COLOR_WRITEMASK
//                                    return [config.random.bool(), config.random.bool(), config.random.bool(), config.random.bool()];
//                                case 33170: // FRAMEBUFFER_BINDING
//                                case 34016: // RENDERBUFFER_BINDING
//                                case 35738: // TEXTURE_BINDING_2D
//                                case 35739: // TEXTURE_BINDING_CUBE_MAP
//                                case 36795: // TRANSFORM_FEEDBACK_BINDING
//                                    return Reflect.apply(target, self, args);

//                                default:
//                                    console.warn("Unhandled WebGL parameter:", args[0]);
//                                    return Reflect.apply(target, self, args);
//                            }
//                        }
//                    });
//                }
//            }
//        }
//    };

//    config.spoof.webgl.buffer(WebGLRenderingContext);
//    config.spoof.webgl.buffer(WebGL2RenderingContext);
//    config.spoof.webgl.parameter(WebGLRenderingContext);
//    config.spoof.webgl.parameter(WebGL2RenderingContext);
//}

//{
//    const mkey = "webgl-defender-sandboxed-frame";
//    document.documentElement.setAttribute(mkey, '');

//    window.addEventListener("message", function (e) {
//        if (e.data && e.data === mkey) {
//            e.preventDefault();
//            e.stopPropagation();

//            if (e.source) {
//                if (e.source.WebGLRenderingContext) {
//                    e.source.WebGLRenderingContext.prototype.bufferData = WebGLRenderingContext.prototype.bufferData;
//                    e.source.WebGLRenderingContext.prototype.getParameter = WebGLRenderingContext.prototype.getParameter;
//                }

//                if (e.source.WebGL2RenderingContext) {
//                    e.source.WebGL2RenderingContext.prototype.bufferData = WebGL2RenderingContext.prototype.bufferData;
//                    e.source.WebGL2RenderingContext.prototype.getParameter = WebGL2RenderingContext.prototype.getParameter;
//                }
//            }
//        }
//    }, false);
//}

