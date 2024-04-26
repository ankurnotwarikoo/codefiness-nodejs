class Validator {
  static validateObjectTypeAndProperties(taskinfo, method) {
    // Check if the method is PUT or POST
    if (method === "PUT" || method === "POST") {
      // Check if all required properties are present and have correct types
      if (
        taskinfo.hasOwnProperty("title") &&
        taskinfo.hasOwnProperty("description") &&
        taskinfo.hasOwnProperty("completed") &&
        typeof taskinfo.title === "string" &&
        typeof taskinfo.description === "string" &&
        typeof taskinfo.completed === "boolean" &&
        taskinfo["description"] &&
        taskinfo["title"]
      ) {
        if (method === "POST" && taskinfo.hasOwnProperty("id")) {
          return false;
        }
        return true;
      }
    }
    return false;
  }
}

module.exports = Validator;
