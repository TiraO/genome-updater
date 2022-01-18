function parseSequenceLine(line) {
  line = line.split('\t')
  let [seqname, source, feature, start, end, score, strand, frame, attributes, comments] = line;
  start = Number.parseInt(start);
  end = Number.parseInt(end);
  return {seqname, source, feature, start, end, score, strand, frame, attributes, comments};
}

function parseSequenceText(text) {
  return text.split("\n").map(parseSequenceLine)
}

function formatSequenceLine(annotation) {
  let {seqname, source, feature, start, end, score, strand, frame, attributes, comments} = annotation;
  let line = [seqname, source, feature, start, end, score, strand, frame, attributes, comments];
  return line.join('\t');
}

//open questions
// 1 index or 0 index on start in the .gtf file?
// <seqname> <source> <feature> <start> <end> <score> <strand> <frame> [attributes] [comments]
function formatSequenceLines(annotations) {
  return annotations.map(formatSequenceLine).join('\n');
}

module.exports = {formatSequenceLine, formatSequenceLines, parseSequenceLine, parseSequenceText}