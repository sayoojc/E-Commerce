let i=0;
function abc(n){
    if(n==0){
        i++;
        return n;
    }
    abc(n-1);
    abc(n-1);
    console.log(i)
}
abc(3)