import pinoPretty from "pino-pretty";
import { Transform } from "stream";
import { RandomBackground } from "./utils.js";

class TintStream extends Transform {
  _transform(chunk, encoding, callback) {
    const [r, g, b] = RandomBackground.latest();
    const bgCode = `\x1b[48;2;${r};${g};${b}m`;
    const reset = `\x1b[0m`;
    const resetWithBg = `${reset}${bgCode}`;

    // Convert chunk to string
    const str = chunk.toString();

    // Apply tint:
    // 1. Start with background color
    // 2. Replace all reset codes with reset + background color (so the bg persists)
    // 3. End with a hard reset
    const tinted = bgCode + str.replaceAll(reset, resetWithBg) + reset + "\n";

    callback(null, tinted);
  }
}

export default function (opts = {}) {
  const tintStream = new TintStream();
  tintStream.pipe(process.stdout);

  return pinoPretty({
    ...opts,
    destination: tintStream, // Output formatted logs to our tint stream
    colorize: true,
    ignore: "pid,hostname",
    translateTime: "SYS:standard",
    customColors: "message:whiteBright",
    messageFormat: (log, messageKey) => {
      RandomBackground.generate();
      return log[messageKey];
    },
  });
}
