# Loopback-advancedmodel
Loopback 3.X advanced Promisified model with Object-oriented API Descriptor

# Installation 

```
npm install loopback-advancedmodel --save
``` 

# Example 

```js
'use strict';
const advancedmodel = require('loopback-advancedmodel');

const Book = new advancedmodel().disableAllMethods();

// Configure Book <uid> property
Book.property('uid',{
    unique: true
});

// Configure Book <name> property
Book.property('name',{
    min_length: 2,
    max_length: 20
});

// Listen for dataSourceAttached event!
Book.on('dataSourceAttached',() => {
    console.log('Datasource attached to book model!');
});

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

// Register findByTag method!
Book.registerRemoteMethod(findByTag)
    .get('/findByTag/:tag')
    .accept({ arg: 'tag', type: 'string'})
    .returns({ arg: 'book', type: 'object' });

module.exports = Book.export();
``` 

# API Documentation

Find all documentation on the wiki section right [here](https://github.com/fraxken/loopback-advancedmodel/wiki)

# Roadmap 

- Find a way to implement ACL to remoteMethods and the whole Model is needed!
