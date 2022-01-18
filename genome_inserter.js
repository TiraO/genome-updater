const {loadFile, derivativePath} = require("./file_helper");

const fs = require("fs");
const _ = require("underscore")
let insertSequence = (originalBases, originalGtfText, newSequence) => {
  let bases = ""
  let beforeBases = originalBases.substring(0, newSequence.annotation.start)
  let afterBases = originalBases.substring(newSequence.annotation.start, originalBases.length)
  bases += beforeBases
  bases += newSequence.bases;
  bases += afterBases;


  let annotations = parseGtf(originalGtfText);
  let [beforeAnnotations, afterAnnotations] = _.partition(annotations, (annotation) => {
    return annotation.start < newSequence.annotation.start
  });

  if (newSequence.bases.length) {
    newSequence.annotation.end = newSequence.annotation.start + newSequence.bases.length
  }

  let allAnnotations = [
    ...offsetAnnotations(beforeAnnotations, newSequence.annotation.start, newSequence.bases.length),
    newSequence.annotation,
    ...offsetAnnotations(afterAnnotations, newSequence.annotation.start, newSequence.bases.length)
  ];

  let gtfText = _.map(allAnnotations, gtfLineText).join('\n');
  return {bases, annotations: allAnnotations, gtfText};
}

let offsetAnnotations = (annotations, newSequenceStart, newSeqLength) => {
  return annotations.map((annotation) => {
    let {start, end} = annotation;
    if (start > newSequenceStart) {
      start += newSeqLength;
    }
    if (end > newSequenceStart) {
      end += newSeqLength;
    }
    return {
      ...annotation,
      start,
      end
    }
  })
};

let parseAnnotation = (gtfLineText) => {
  let line = gtfLineText.split('\t')
  let [seqname, source, feature, start, end, score, strand, frame, attributes, comments] = line;
  // try {
  start = Number.parseInt(start);
  end = Number.parseInt(end);
  // } catch (e){
  // console.warn(e, 'failed to parse start / end index');
  // }
  return {seqname, source, feature, start, end, score, strand, frame, attributes, comments};
}
let gtfLineText = (annotation) => {
  let {seqname, source, feature, start, end, score, strand, frame, attributes, comments} = annotation;
  let line = [seqname, source, feature, start, end, score, strand, frame, attributes, comments];
  return line.join('\t');
}

let parseGtf = (tsv) => {
  let lines = tsv.split("\n");
  let rowsWithCells = lines.map((line) => {
    return parseAnnotation(line);
  });

  return rowsWithCells;
}

let toGtf = (annotations) => {
  return annotations.map(gtfLineText).join("\n");
}

const runInsertion = async (basesPath, gtfPath, basesToInsertPath, annotationToInsertPath, outputBasesPath, outputGtfPath) => {
  let originalBases = loadFile(basesPath);
  let originalGtfText = loadFile(gtfPath);
  let newBases = loadFile(basesToInsertPath);
  let gtfLineText = loadFile(annotationToInsertPath);
  let annotationToInsert = parseGtf(gtfLineText)[0];
  let newSequence = {bases: newBases, annotation: annotationToInsert};

  let {bases, gtfText} = insertSequence(originalBases, originalGtfText, newSequence)

  outputBasesPath = outputBasesPath || derivativePath(basesPath, "altered");
  outputGtfPath = outputGtfPath || derivativePath(gtfPath, "altered");
  fs.writeFileSync(outputBasesPath, bases)
  fs.writeFileSync(outputGtfPath, gtfText)
}

module.exports = {insertSequence, parseGtf, toGtf, runInsertion}