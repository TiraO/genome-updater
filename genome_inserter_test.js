const {loadFile} = require("./file_helper");
const {createTestDataFile, fileExists, removeAllTestDataFiles, testDataPath, testFixturePath} = require("./test_file_helper");
let {runInsertion, insertSequence, parseGtf, toGtf} = require("./genome_inserter.js")
let {expect} = require("chai")
const _ = require("underscore");
//open questions
// 1 index or 0 index on start in the .gtf file?
// <seqname> <source> <feature> <start> <end> <score> <strand> <frame> [attributes] [comments]
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

    it('should add the sequence to dna_output.txt', () => {
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
      let newAnnotations = parseGtf(result.gtfText);

      expect(newAnnotations[2].start).to.eq(18);
      expect(newAnnotations[2].end).to.eq(19);
    });

    it("writes the gtf ordered by start index of the annotations", () => {

    });

    describe("when an annotation starts before the new annotation, but overlaps it", () => {
      beforeEach(() => {
        originalGtfText = toGtf([{seqname: "overlapper", start: 2, end: 8}]);
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
      createTestDataFile("dna.txt", loadFile(testFixturePath("dna.txt")))
      createTestDataFile("annotations.gtf", loadFile(testFixturePath("annotations.gtf")))
    });

    it("creates a new bases file and annotations file", async () => {
      await runInsertion(testDataPath("dna.txt"), testDataPath("annotations.gtf"),
        testFixturePath("new_gene.txt"), testFixturePath("new_gene.gtf"))
      expect(fileExists(testDataPath("dna_altered.txt"))).to.eq(true)
      expect(fileExists(testDataPath("annotations_altered.gtf"))).to.eq(true);
    });


  });
});
