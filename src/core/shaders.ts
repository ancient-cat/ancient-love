export type GLSL = unknown;
// This is the "identity" tagged template literal
// from this region https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#raw_strings
export const glsl = (strings: TemplateStringsArray, ...values: string[]): GLSL => {
  return strings.reduce((acc, str, i) => {
    const value = values[i] ?? "";
    return acc + str + value;
  }, "");

  // TSTL does not support String.raw
  // return String.raw({ raw: strings }, ...values);
};

// Below is a test of syntax highlighting
const test: GLSL = glsl` 
  extern screenWidth: int;
  extern screenHeight: int;
  vec4 effect( vec4 color, Image texture, vec2 texture_coords, vec2 screen_coords ){
      vec4 pixel = Texel(texture, texture_coords );//This is the current pixel color
      return pixel * color;
  }
`;

/**
 * Defines a shader and allows you to pass variables to it
 * @param program A Love-shader program

@example
```ts
const example_shader = create_shader<{ w: number; h: number; data: number[]; }>(glsl`
    extern w: int;
    extern h: int;
    vec4 effect( vec4 color, Image texture, vec2 texture_coords, vec2 screen_coords ){
        vec4 pixel = Texel(texture, texture_coords );//This is the current pixel color
        return pixel * color;
    }
`);
example_shader.send("w", 10);
example_shader.send("h", 10);
example_shader.send("data", [10, 10]);
```
 */
export const create_shader = <ProgramArgs extends Record<string, any>>(program: GLSL) => {
  const shader = love.graphics.newShader(program as string);
  return {
    shader,
    /**
     *
     * @param variable The name of a variable (as declared with extern)
     * @param value
     */
    send: <ArgName extends keyof ProgramArgs>(variable: ArgName, sent_value: ProgramArgs[ArgName]) => {
      if (Array.isArray(sent_value)) {
        shader.send(variable as string, ...(sent_value as Array<any>));
      } else {
        shader.send(variable as string, sent_value);
      }
    },
  };
};
