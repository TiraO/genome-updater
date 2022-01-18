const fs = require("fs");
const _ = require("underscore")

let insertSequence = (originalBases, originalGtfText, newSequence) => {
  let bases = ""
  let beforeBases = originalBases.substring(0, newSequence.annotation.start)
  let afterBases = originalBases.substring(newSequence.annotation.start, originalBases.length)
  bases += beforeBases
  bases += newSequence.bases;
  bases += afterBases;

  let lines = originalGtfText.split("\n");
  let annotations = lines.map((line) => {
    line = line.split('\t')
    let [seqname, source, feature, start, end, score, strand, frame, attributes, comments] = line;
    start = Number.parseInt(start);
    end = Number.parseInt(end);
    return {seqname, source, feature, start, end, score, strand, frame, attributes, comments};
  });

  let [beforeAnnotations, afterAnnotations] = _.partition(annotations, (annotation) => {
    return annotation.start < newSequence.annotation.start
  });

  if (newSequence.bases.length) {
    newSequence.annotation.end = newSequence.annotation.start + newSequence.bases.length
  }

  let allAnnotations = [
    ...(beforeAnnotations.map((annotation) => {
      let {start, end} = annotation;
      if (start > newSequence.annotation.start) {
        start += newSequence.bases.length;
      }
      if (end > newSequence.annotation.start) {
        end += newSequence.bases.length;
      }
      return {
        ...annotation,
        start,
        end
      }
    })),
    newSequence.annotation,
    ...(afterAnnotations.map((annotation) => {
      let {start, end} = annotation;
      if (start > newSequence.annotation.start) {
        start += newSequence.bases.length;
      }
      if (end > newSequence.annotation.start) {
        end += newSequence.bases.length;
      }
      return {
        ...annotation,
        start,
        end
      }
    }))
  ];

  let gtfText = _.map(allAnnotations, (annotation) => {
    let {seqname, source, feature, start, end, score, strand, frame, attributes, comments} = annotation;
    let line = [seqname, source, feature, start, end, score, strand, frame, attributes, comments];
    return line.join('\t');
  }).join('\n');
  return {bases, annotations: allAnnotations, gtfText};
}

const runInsertion = async (basesPath, gtfPath, basesToInsertPath, annotationToInsertPath, outputBasesPath, outputGtfPath) => {
  let originalBases = fs.readFileSync(basesPath, "UTF-8");
  let originalGtfText = fs.readFileSync(gtfPath, "UTF-8");
  let newBases = fs.readFileSync(basesToInsertPath, "UTF-8");
  let gtfLineText = fs.readFileSync(annotationToInsertPath, "UTF-8");

  let lines = gtfLineText.split("\n");
  let rowsWithCells = lines.map((gtfLineText) => {
    let line = gtfLineText.split('\t')
    let [seqname, source, feature, start, end, score, strand, frame, attributes, comments] = line;
    start = Number.parseInt(start);
    end = Number.parseInt(end);

    return {seqname, source, feature, start, end, score, strand, frame, attributes, comments};
  });
  let annotationToInsert = rowsWithCells[0];

  let newSequence = {bases: newBases, annotation: annotationToInsert};

  let {bases, gtfText} = insertSequence(originalBases, originalGtfText, newSequence)

  if(!outputBasesPath){
    let extensionStart = basesPath.lastIndexOf('.');
    let extensionToUse = basesPath.substr(extensionStart);
    let transformPart = "";
    transformPart = "_altered";
    outputBasesPath = basesPath.substr(0, extensionStart) + transformPart + extensionToUse;
  }

  if(!outputGtfPath){
    let extensionStart = gtfPath.lastIndexOf('.');
    let extensionToUse = gtfPath.substr(extensionStart);
    let transformPart = "";
    transformPart = "_altered";
    outputGtfPath = gtfPath.substr(0, extensionStart) + transformPart + extensionToUse;
  }


  console.log("saving updated bases file as ", outputBasesPath);
  fs.writeFileSync(outputBasesPath, bases)
  console.log("saving updated annotations file as ", outputGtfPath);
  fs.writeFileSync(outputGtfPath, gtfText)
}

module.exports = {insertSequence, runInsertion}