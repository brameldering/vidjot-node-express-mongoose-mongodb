const { createLogger, format, transports } = require("winston");
const logform = require("logform");
const tripleBeam = require("triple-beam");

const errorHunter = logform.format((info) => {
  if (info.error) return info;
  const splat = info[tripleBeam.SPLAT] || [];
  info.error = splat.find((obj) => obj instanceof Error);
  return info;
});

const errorPrinter = logform.format((info) => {
  if (!info.error) return info;
  // Handle case where Error has no stack.
  const errorMsg = info.error.stack || info.error.toString();
  info.message += `\n${errorMsg}`;
  return info;
});

const winstonConsoleFormat = logform.format.combine(
  errorHunter(),
  errorPrinter(),
  logform.format.printf((info) => `${info.level}: ${info.message}`),
  format.timestamp(),
  format.json()
);

const logger = createLogger({
  level: "info",
  //   format: format.combine(format.timestamp(), format.json()),
  format: winstonConsoleFormat,
  defaultMeta: {}, // service: "user-service"
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new transports.File({ format: winstonConsoleFormat, filename: "error.log", level: "error" }),
    new transports.File({ format: winstonConsoleFormat, filename: "combined.log" }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      //   format: format.combine(format.timestamp(), format.json()),
      format: winstonConsoleFormat,
    })
  );
}

module.exports = logger;
