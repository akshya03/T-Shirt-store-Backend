// extracting query params and converting operators for mongoose queries=> User.find({qty: {$lte: 20}})
// bigQ - search=coder&page=2&category=shortSleeves&rating[gte]=4&price[lte]=999&price[gte]=199&limit=5
// base-Product.find()
// base-Product.find({email: "test@lco.dev"})

class WhereClause{
    constructor(base, bigQ){
        this.base = base,
        this.bigQ = bigQ
    }
    search(){
        console.log(`--- WhereClause: search ---`);
        console.log(`searchWord:${this.bigQ.search}`);
        const searchWord = this.bigQ.search?{
            name:{
                $regex: this.bigQ.search,
                $options: 'i'       //case insensitivity
            }
        }:{};

        console.log(`this.base before FIND: ${this.base}`);
        this.base = this.base.find({...searchWord});
        console.log(`this.base after FIND: ${this.base}`);
        return this;
    }

    pager(resultPerPage){
        console.log(`--- WhereClause: pager ---`);
        console.log(`this.bigQ.page: ${this.bigQ.page}`);
        let currentPage = 1;
        if(this.bigQ.page) //if current page is different  
            currentPage = this.bigQ.page

        const skipVal = resultPerPage * (currentPage-1)     //pagination formula
        
        console.log(`this.base before LIMIT and SKIP: ${this.base}`);
        this.base = this.base.limit(resultPerPage).skip(skipVal);
        console.log(`this.base after LIMIT and SKIP: ${this.base}`);
        return this;
    }

    //till here SEARCH, PAGE, LIMIT has been handled from bigQuery params
    filter(){
        console.log(`--- WhereClause: filter ---`);
        console.log(`this.bigQ: ${this.bigQ}`);
        const copyQ = {...this.bigQ};
        console.log(`copyQ before delete: ${copyQ}`);

        delete copyQ["search"];
        delete copyQ["page"];
        delete copyQ["limit"];
        console.log(`copyQ after delete: ${copyQ}`);
        
        //convert bigQ into a string => copyQ
        let stringOfCopyQ = JSON.stringify(copyQ);
        console.log(`stringOfCopyQ before replace: ${stringOfCopyQ}`);
        stringOfCopyQ = stringOfCopyQ.replace(
        /\b(gte|lte|gt|lt)\b/g, //regex, converts lte -> $lte
        m => `$${m}`
        );
        console.log(`stringOfCopyQ after replace: ${stringOfCopyQ}`);

        const jsonOfCopyQ = JSON.parse(stringOfCopyQ);
        console.log(`jsonOfCopyQ: ${jsonOfCopyQ}`);

        console.log(`this.base before FIND: ${this.base}`);
        this.base = this.base.find(jsonOfCopyQ);
        console.log(`this.base after FIND: ${this.base}`);
        return this;
    }
}

module.exports = WhereClause;