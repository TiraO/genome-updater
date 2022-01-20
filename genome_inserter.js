const _ = require("underscore");
const {loadFile, writeFile} = require("./file_helper");
const {parseSequenceLine, formatSequenceLine, formatSequenceLines, parseSequenceText} = require("./sequence_format_utils");

function offsetAnnotations(annotations, sequence, stats = { offsetCount: 0}) {
  return annotations.map((annotation) => {
    let {start, end} = annotation;
    let updated = false;
    if (start > sequence.annotation.start) {
      start += sequence.bases.length;
      updated = true;
    }
    if (end > sequence.annotation.start) {
      end += sequence.bases.length;
      updated = true;
    }
    if(updated){
      stats.offsetCount ++;
    }
    return {
      ...annotation,
      start,
      end
    }
  });
}

let insertSequence = (originalBases, originalGtfText, newSequence) => {
  let bases = ""
  let beforeBases = originalBases.substring(0, newSequence.annotation.start)
  let afterBases = originalBases.substring(newSequence.annotation.start, originalBases.length)
  bases += beforeBases
  bases += newSequence.bases;
  bases += afterBases;

  let annotations = parseSequenceText(originalGtfText);

  let [beforeAnnotations, afterAnnotations] = _.partition(annotations, (annotation) => {
    return annotation.start < newSequence.annotation.start
  });

  if (newSequence.bases.length) {
    newSequence.annotation.end = newSequence.annotation.start + newSequence.bases.length
  }
  console.log("inserting ", newSequence.bases.length, " new bases")
  console.log("starting at ", newSequence.annotation.start, "ending at ", newSequence.annotation.end)


  let stats = {offsetCount: 0};
  let allAnnotations = [
    ...(offsetAnnotations(beforeAnnotations, newSequence, stats)),
    newSequence.annotation,
    ...(offsetAnnotations(afterAnnotations, newSequence, stats))
  ];

  console.log("updated ", stats.offsetCount, "annotations in the gtf file.");
  let gtfText = formatSequenceLines(allAnnotations);
  return {bases, annotations: allAnnotations, gtfText};
}

function getOutputFilePath(outputPath, inputPath) {
  if (!outputPath) {
    let extensionStart = inputPath.lastIndexOf('.');
    let extensionToUse = inputPath.substr(extensionStart);
    let transformPart = "_altered";
    outputPath = inputPath.substr(0, extensionStart) + transformPart + extensionToUse;
  }
  return outputPath;
}

const runInsertion = async (basesPath, gtfPath, basesToInsertPath, annotationToInsertPath, outputBasesPath, outputGtfPath) => {
  let originalBases = loadFile(basesPath);
  let originalGtfText = loadFile(gtfPath);
  let newBases = loadFile(basesToInsertPath);
  let gtfLineText = loadFile(annotationToInsertPath);

  let rowsWithCells = parseSequenceText(gtfLineText);
  let annotationToInsert = rowsWithCells[0];

  let newSequence = {bases: newBases, annotation: annotationToInsert};
  let {bases, gtfText} = insertSequence(originalBases, originalGtfText, newSequence)

  const updatedBasesPath = getOutputFilePath(outputBasesPath, basesPath);
  const updatedGtfPath = getOutputFilePath(outputGtfPath, gtfPath);

  writeFile(updatedBasesPath, bases, "bases");
  writeFile(updatedGtfPath, gtfText, "annotations");
}

module.exports = {insertSequence, runInsertion, formatSequenceLine, parseSequenceLine, getOutputFilePath}
