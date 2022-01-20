const { expect } = require("chai");

const { derivativePath } = require("./file_helper");

describe("path_helper", () => {
  describe("derivativePath", () => {
    it("replaces the file extension", () => {
      expect(derivativePath("/path/to/some/banana.fasta", "squashed", ".gtf"))
        .to.eq("/path/to/some/banana_squashed.gtf");
    });

    describe("when no extension is given", () => {
      it("uses the original file extension", () => {
        expect(derivativePath("/path/to/some/banana.fasta", "squashed"))
          .to.eq("/path/to/some/banana_squashed.fasta");
      });
    });
  });
});
