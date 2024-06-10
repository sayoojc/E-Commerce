let n1=1;
let n2='';
let n3=3;
let n4=4;


const isValidInput = n1 && n2 && n3 && n4 && /^\d+$/.test(n1 + n2 + n3 + n4);


console.log(isValidInput);