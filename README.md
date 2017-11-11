# Loopback-advancedmodel
Loopback 3.X advanced Promisified model with an Object-oriented API Descriptor.

# Features

- Promisified remoteMethod with Async/Await support
- Register multiple property validation easily.
- Auto-catch throwed error in the remoteMethod.
- Composable API (Swagger) descriptor (It work like a kind of factory).
- Lock a whole model for authenticated user
- Basic ACLs management

# Installation 

```
npm install loopback-advancedmodel --save
``` 

# Usage example

Here i create a generic book model with a name and tag property ! 

```js
'use strict';
const advancedmodel = require('loopback-advancedmodel');

// Create your Book Model
const Book = new advancedmodel()

// Disable all methods except findOne
Book.disableAllMethods(['findOne']);

// Configure Book <name> property
Book.property('name',{
    unique: true,
    min_length: 2,
    max_length: 20
});

// Eventually listen for dataSourceAttached event!
Book.on('dataSourceAttached',() => {
    console.log('Datasource attached to book model!');
});

/**
 * Find a book by tag!
 */
async function findByTag({ params: [tag], model: bookModel}) {
    console.log(`Find book by tag => ${tag}`);
    let book = await bookModel.findOne({ where: {tag} });
    if(book == null) {
        book = await bookModel.create({
            name: 'Example book!',
            tag
        });
    }
    console.log(book);
    return book;
}

// Register findByTag method and describe the route for the explorer/Swagger output !
Book.registerRemoteMethod(findByTag)
    .get('/findByTag/:tag')
    .accept({ arg: 'tag', type: 'string'})
    .returns({ arg: 'book', type: 'object' });

// Export your Model
module.exports = Book.export();
``` 

# API Documentation

Find all documentation on the wiki section right [here](https://github.com/fraxken/loopback-advancedmodel/wiki)
