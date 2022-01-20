const {runInsertion} = require("./genome_inserter")


return runInsertion("C://Users/Tira/bases.fasta",
  "C://Users/Tira/annotations.gtf",
  "C://Tira/sequence-to-insert.fasta",
  "C://Users/Tira/annotation-to-insert.gtf", // This gtf file should only have one line. start/end in this file tells the code where the sequence should be inserted and how long it is.
  // "C://Users/Tira/output-sequence.fasta",
  // "C://Users/Tira/output-annotations.gtf",
)

