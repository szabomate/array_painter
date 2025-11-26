let display_width = 64;
let display_height = 32;
let pixel_size = 12;
const grid = 8;
let draw_buffer;
let buffer;
let buffer_format = 16;
let buffer_num_regs = 0;

let mouse_action = 0;
const clear = 0;
const set = 1;
let mouse_last_x = 0;
let mouse_last_y = 0;

let widthInput, widthLabel;
let heightInput, heightLabel;
let sizeInput, sizeLabel;
let formatInput, formatLabel;

let clearButton, archiveButton;

function setup() {
  widthLabel = createSpan("WIDTH");
  widthLabel.style("color", "#FFFFFF");
  widthLabel.style("font-family", "monospace");
  widthLabel.style("font-size", "12px");
  widthInput = createInput("64");
  widthInput.size(30); // width of the input box
  widthInput.changed(() => {
    display_width = int(widthInput.value());
    out.html("");
    reset();
  });

  heightLabel = createSpan("HEIGHT");
  heightLabel.style("color", "#FFFFFF");
  heightLabel.style("font-family", "monospace");
  heightLabel.style("font-size", "12px");
  heightInput = createInput("32");
  heightInput.size(30); // width of the input box
  heightInput.changed(() => {
    display_height = int(heightInput.value());
    out.html("");
    reset();
  });

  sizeLabel = createSpan("PIXEL SIZE");
  sizeLabel.style("color", "#FFFFFF");
  sizeLabel.style("font-family", "monospace");
  sizeLabel.style("font-size", "12px");
  sizeInput = createInput("12");
  sizeInput.size(30); // width of the input box
  sizeInput.changed(() => {
    pixel_size = int(sizeInput.value());
    out.html("");
    reset();
  });

  formatLabel = createSpan("FORMAT");
  formatLabel.style("color", "#FFFFFF");
  formatLabel.style("font-family", "monospace");
  formatLabel.style("font-size", "12px");
  formatInput = createInput("16");
  formatInput.size(30); // width of the input box
  formatInput.changed(() => {
    buffer_format = int(formatInput.value());
    out.html("");
    reset();
  });

  clearButton = createButton("Clear!");
  clearButton.mousePressed(clear_buffer); // call on click
  archiveButton = createButton("Archive!");
  archiveButton.mousePressed(archive_buffer); // call on click

  reset();
}

function reset() {
  select("body").style("background-color", "#7B188D");

  // display_height must be multiple of buffer_format
  buffer_num_regs = display_height / buffer_format;
  if (!Number.isInteger(buffer_num_regs))
    buffer_num_regs = floor(buffer_num_regs) + 1;
  // display_height = buffer_format * buffer_num_regs;

  let canvas_width = display_width * pixel_size;
  let canvas_height = display_height * pixel_size;

  createCanvas(canvas_width, canvas_height);

  // init draw buffer
  draw_buffer = Array.from({ length: display_width }, () =>
    Array(display_height).fill(0)
  );

  // init data buffer
  buffer = Array.from({ length: display_width }, () =>
    Array(buffer_num_regs).fill(0)
  );

  // init data buffer
  let data_x = display_width;

  // buttons
  clearButton.position(10, height + 10);
  archiveButton.position(10, height + 30);

  // inputs
  widthLabel.position(60, height + 63);
  widthInput.position(10, height + 60);
  heightLabel.position(60, height + 83);
  heightInput.position(10, height + 80);
  sizeLabel.position(60, height + 103);
  sizeInput.position(10, height + 100);
  formatLabel.position(60, height + 123);
  formatInput.position(10, height + 120);

  // text element below canvas
  out = createP(""); // text element below canvas
  out.position(10, height + 140);
  out.style("color", "#FFFFFF"); // green
  out.style("font-family", "Courier New"); // monospace
  out.style("font-size", "10px");
}

function draw() {
  background(255);
  flush_buffer();
  create_data();
  print_array();
}

function create_data() {
  for (let x = 0; x < display_width; x++) {
    for (let reg = 0; reg < buffer_num_regs; reg++) {
      buffer[x][reg] = 0;
      for (let pixel = 0; pixel < buffer_format; pixel++) {
        if (draw_buffer[x][reg * buffer_format + pixel] == 1) {
          buffer[x][reg] |= 1 << pixel;
        }
      }
    }
  }
}

function print_array() {
  print_start(); // clears html text
  for (let x = 0; x < display_width; x++) {
    for (let reg = 0; reg < buffer_num_regs; reg++) {
      print_data(toHex(buffer[x][reg]));
    }
  }
  print_stop();
}

function clear_buffer() {
  for (let w = 0; w < display_width; w++) {
    for (let h = 0; h < display_height; h++) {
      draw_buffer[w][h] = 0;
    }
  }
}

function archive_buffer() {
  for (let w = 0; w < display_width; w++) {
    for (let h = 0; h < display_height; h++) {
      if (draw_buffer[w][h] == 1) draw_buffer[w][h] = 2;
    }
  }
}

function flush_buffer() {
  // pixels
  stroke(40);
  strokeWeight(1);
  for (let w = 0; w < display_width; w++) {
    for (let h = 0; h < display_height; h++) {
      if (draw_buffer[w][h] == 1) fill(255);
      else if (draw_buffer[w][h] == 2) fill(60);
      else fill(0);
      rect(w * pixel_size, h * pixel_size, pixel_size, pixel_size);
    }
  }

  // target
  if (
    mouseX < display_width * pixel_size &&
    mouseY < display_height * pixel_size
  ) {
    // quantize position
    let x_ = floor(mouseX / pixel_size);
    let y_ = floor(mouseY / pixel_size);
    strokeWeight(0);
    fill(255, 255, 255, 30);
    rect(0, y_ * pixel_size, display_width * pixel_size, pixel_size);
    rect(x_ * pixel_size, 0, pixel_size, display_height * pixel_size);
  }

  // grid
  stroke(60); // line color
  strokeWeight(1); // line thickness
  for (let x = 1; x < display_width; x++) {
    if (x % grid == 0)
      line(x * pixel_size, 0, x * pixel_size, display_height * pixel_size);
  }
  for (let y = 1; y < display_height; y++) {
    if (y % grid == 0)
      line(0, y * pixel_size, display_width * pixel_size, y * pixel_size);
  }
}

function mousePressed() {
  if (mouseX > display_width * pixel_size) return;
  else if (mouseY > display_height * pixel_size) return;
  else {
    let x = floor(mouseX / pixel_size);
    let y = floor(mouseY / pixel_size);
    // action is determined when mouse clicks into the display
    // if pixel was black -> draw
    // if pixel was white -> erease
    if (draw_buffer[x][y] == 0) mouse_action = set;
    else if (draw_buffer[x][y] == 1) mouse_action = clear;
    if (draw_buffer[x][y] < 2) draw_buffer[x][y] = mouse_action;
    mouse_last_x = x;
    mouse_last_y = y;
  }
}

function mouseDragged() {
  if (mouseX > display_width * pixel_size) return;
  let x = floor(mouseX / pixel_size);
  let y = floor(mouseY / pixel_size);
  if (x != mouse_last_x || (y != mouse_last_y && draw_buffer[x][y] < 2))
    draw_buffer[x][y] = mouse_action;
  mouse_last_x = x;
  mouse_last_y = y;
}

function toHex(n) {
  return "0x" + n.toString(16).padStart(buffer_format / 4, "0");
}

let element_count = 0;

function print_start() {
  out.html("const uint" + buffer_format + "_t data[]= {<br>"); // clears html text
  out.html(out.html() + "&nbsp;&nbsp;");
  element_count = 0;
}

function print_data(msg) {
  out.html(out.html() + msg + ", ");
  if (++element_count == 8) {
    element_count = 0;
    out.html(out.html() + "<br>");
    out.html(out.html() + "&nbsp;&nbsp;");
  }
}

function print_stop() {
  out.html(out.html() + "}<br>"); // clears html text
}
