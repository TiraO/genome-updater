const {runInsertion} = require("./genome_inserter")


return runInsertion("C://Users/Tira/bases.fasta",
  "C://Users/Tira/annotations.gtf",
  "C://Tira/new_sequence.fasta",
  "C://Users/Tira/new-annotation.gtf" // This gtf file should only have one line.
)

