const {runInsertion} = require("./genome_inserter")


return runInsertion("C://Users/Tira/bases.txt",
  "C://Users/Tira/annotations.gtf",
  "C://Tira/new_sequence.txt",
  "C://Users/Tira/new-annotation.gtf" // This gtf file should only have one line.
)

