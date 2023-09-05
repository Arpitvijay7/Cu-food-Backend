class ApiFeatures {
  constructor(query, queryStr, menuID) {
    this.query = query;
    this.queryStr = queryStr;
    this.menuID = menuID;
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        }
      : {};
    this.query = this.query.find({ ...keyword });
    return this;
  }

  menuSearch() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        }
      : {};
    this.query = this.query.find({ _id : this.menuID ,...keyword}).limit(1);
    return this;
  }
}

module.exports = ApiFeatures;
