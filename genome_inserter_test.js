const {loadFile} = require("./file_helper");
const {createTestDataFile, fileExists, removeAllTestDataFiles, testDataPath, testFixturePath} = require("./test_file_helper");
let {runInsertion, insertSequence} = require("./genome_inserter.js")
let {expect} = require("chai")
const _ = require("underscore");
const {formatSequenceLines, parseSequenceText} = require("./sequence_format_utils");

const DNA_FILE_NAME = "dna.fasta";
const ANNOTATIONS_FILE_NAME = "annotations.gtf";

describe('GenomeInserter', () => {
  describe('#insertSequence', () => {
    let newSequence, originalBases, originalGtfText;
    before(() => {
      newSequence = {
        bases: 'TAGCTAaacc',
        annotation: {
          seqname: 'a123',
          start: 5,
        }
      }
      originalBases = "AAAAAAAAAA"
      originalGtfText = "some-id\tsome-other-name\tfeat\t2\t4\tsome description stuff\n" +
        "some-id2\tsome-other-name\tfeat\t8\t9\tsome second description stuff"
    });

    it('should add the sequence to dna_output.fasta', () => {
      let result = insertSequence(originalBases, originalGtfText, newSequence)
      let newBases = result.bases;
      expect(newBases).to.eq("AAAAATAGCTAaaccAAAAA");
    });

    it('should add a new annotation for the new sequence to the annotations', () => {
      let result = insertSequence(originalBases, originalGtfText, newSequence)

      expect(result.annotations).to.have.length(3);
      let addedAnnotation = _.findWhere(result.annotations, {seqname: "a123"});
      expect(addedAnnotation).to.deep.eq({seqname: "a123", start: 5, end: 15})
    });

    it("should not change annotations that are before the insertion", () => {
      let result = insertSequence(originalBases, originalGtfText, newSequence)

      let beforeAnnotation = _.findWhere(result.annotations, {seqname: "some-id"});
      expect(beforeAnnotation.start).to.eq(2)
      expect(beforeAnnotation.end).to.eq(4)

    })
    it('should update the locations of annotations that are after the insertion', () => {
      let result = insertSequence(originalBases, originalGtfText, newSequence)
      let newAnnotations = parseSequenceText(result.gtfText);

      expect(newAnnotations[2].start).to.eq(18);
      expect(newAnnotations[2].end).to.eq(19);
    });

    it("writes the gtf ordered by start index of the annotations", () => {
      let result = insertSequence(originalBases, originalGtfText, newSequence)
      let newAnnotations = parseSequenceText(result.gtfText);

      expect(newAnnotations[0].start).to.eq(2);
      expect(newAnnotations[1].start).to.eq(5);
      expect(newAnnotations[2].start).to.eq(18);
    });

    describe("when an annotation starts before the new annotation, but overlaps it", () => {
      beforeEach(() => {
        originalGtfText = formatSequenceLines([{seqname: "overlapper", start: 2, end: 8}]);
      });

      it("updates the end index of the existing annotation", () => {
        let result = insertSequence(originalBases, originalGtfText, newSequence)
        expect(result.annotations[0].start).to.eq(2);
        expect(result.annotations[0].end).to.eq(18);
      });
    });
  });

  describe("#runInsertion", () => {
    beforeEach(async () => {
      await removeAllTestDataFiles();
      createTestDataFile(DNA_FILE_NAME, loadFile(testFixturePath(DNA_FILE_NAME)))
      createTestDataFile(ANNOTATIONS_FILE_NAME, loadFile(testFixturePath(ANNOTATIONS_FILE_NAME)))
    });

    it("creates a new bases file and annotations file", async () => {
      await runInsertion(testDataPath(DNA_FILE_NAME), testDataPath(ANNOTATIONS_FILE_NAME),
        testFixturePath("new_gene.fasta"), testFixturePath("new_gene.gtf"))
      expect(fileExists(testDataPath("dna_altered.fasta"))).to.eq(true)
      expect(fileExists(testDataPath("annotations_altered.gtf"))).to.eq(true);
    });


  });
});
