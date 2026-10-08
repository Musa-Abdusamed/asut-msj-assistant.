const {
  cosineSimilarity
} = require("./services/vector.service");

const A = [0.9, 0.8, 0.7];
const B = [0.8, 0.7, 0.6];
const C = [-0.8, -0.7, -0.9];

console.log("A vs B:", cosineSimilarity(A, B));
console.log("A vs C:", cosineSimilarity(A, C));