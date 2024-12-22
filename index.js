const express = require('express');
const app = express();
require('dotenv').config()
const cors = require('cors');
const port = process.env.PORT || 5000;


// middleware

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t6d3xec.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const itemCollection = client.db("onlineShop").collection('items');
    //  Login User Details
    const userCollection = client.db('onlineShop').collection('users');
    //  Carts Details
    const cartCollection = client.db('onlineShop').collection('carts');
    //  Oder Details 
    const oderCollection = client.db('onlineShop').collection('oders');
    //   Drivers details
    const driverCollection = client.db('onlineShop').collection('drivers');
    // Banner Collection
    const bannerCollection = client.db('onlineShop').collection('banners');
    // Banner Collection
    const categoriesCollection = client.db('onlineShop').collection('categories');
    // Company Informations
    const informationCollection = client.db('onlineShop').collection('informations');


    app.get('/items', async (req, res) => {

      const result = await itemCollection.find().toArray();
      res.send(result);
    })
    app.post('/items', async (req, res) => {
      const item = req.body;
      const result = await itemCollection.insertOne(item);
      res.send(result);
    })
    app.delete('/items/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await itemCollection.deleteOne(query);
      res.send(result)
    })
    app.get('/items/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await itemCollection.findOne(query)
      res.send(result)
    })

    //  For Update 
    app.patch('/items/:id', async (req, res) => {
      const item = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          name: item.name,
          category: item.category,
          price: item.price,
          description: item.description,
          arbName: item.ArbName,
          image: item.image
        }
      }
      const result = await itemCollection.updateOne(filter, updateDoc)
      res.send(result);
    })


    // Confirm Oder Detail

    // app.post('/oderConfirm',async(req,res)=>{
    //   const oder = req.body;
    //   const oderResult = await oderCollection.insertOne(oder);

    //   console.log("oder info", oder);
    //   const query = {_id: {
    //     $in: oder.cardIds.map(id => new ObjectId(id))
    //   }};
    //   const deleteResult = await cartCollection.deleteMany(query);
    //   res.send({oderResult,deleteResult});

    // })



    // OKK UNDER
    // app.post('/oderConfirm', async (req, res) => {
    //   try {
    //     const oder = req.body;

    //     // Insert the order into the database
    //     const oderResult = await oderCollection.insertOne(oder);


    //     // Create a query to find and delete the corresponding items in the cart collection
    //     const query = {
    //       _id: {
    //         $in: oder.cardIds.map(id => new ObjectId(id))
    //       }
    //     };

    //     // Delete the cart items
    //     const deleteResult = await cartCollection.deleteMany(query);

    //     // Send the results back to the client
    //     res.send({ oderResult, deleteResult });
    //   } catch (error) {
    //     console.error("Error processing order:", error);
    //     res.status(500).send({ error: "An error occurred while processing the order." });
    //   }
    // });
    app.post('/oderConfirm', async (req, res) => {
      const oder = req.body;
      const oderResult = await oderCollection.insertOne(oder);
      const query = {
        _id: {
          $in: oder.cardIds.map(id => new ObjectId(id))
        }
      };
      const deleteResult = await cartCollection.deleteMany(query);
      res.send({ oderResult, deleteResult })
    })


    app.get('/orderConfirm/:contact', async (req, res) => {
      const query = { contact: req.params.contact };

      const result = await oderCollection.find(query).toArray();
      res.send(result);
    });

    app.get('/orders', async (req, res) => {
      const { contact } = req.query;
      try {
          let orders;
  
          if (contact) {
              // If contact is provided, fetch orders matching that contact
              orders = await oderCollection.find({ contact }).toArray();
          } else {
              // If no contact is provided, fetch all orders
              orders = await oderCollection.find().toArray();
          }
  
          res.send(orders);
      } catch (error) {
          console.error("Error fetching orders:", error);
          res.status(500).send({ error: "An error occurred while fetching orders." });
      }
  });
  
    app.get('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await oderCollection.findOne(query)
      res.send(result)
    })

 // Express route to update order status
app.patch('/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;  // Expecting the new status from the request body

  try {
      const updatedOrder = await oderCollection.updateOne(
          { _id: new ObjectId(id) }, // Find order by _id
          { $set: { status: status } } // Update the status field
      );
      
      if (updatedOrder.modifiedCount > 0) {
          res.status(200).send({ message: 'Order status updated successfully' });
      } else {
          res.status(404).send({ message: 'Order not found or already updated' });
      }
  } catch (error) {
      res.status(500).send({ message: 'Error updating order status', error });
  }
});


    //  FOR LOGIN USER

    // Route to create a new user 
    //  app.post('/user', async (req, res) => {
    //   const { name, contact, location } = req.body;
    //   try {
    //     const existingUser = await userCollection.findOne({ contact });
    //     if (existingUser) {
    //       res.status(200).json(existingUser);
    //     } else {
    //       const newUser = { name, contact, location };
    //       const result = await userCollection.insertOne(newUser);
    //       res.status(201).json({ insertedId: result.insertedId });
    //     }
    //   } catch (error) {
    //     res.status(500).json({ error: error.message });
    //   }
    // });
    app.post('/user', async (req, res) => {
      const { name, contact, location } = req.body;
      try {
        const existingUser = await userCollection.findOne({ contact });
        if (existingUser) {
          // Return the existing user if they already exist
          res.status(200).json(existingUser);
        } else {
          const newUser = { name, contact, location };
          const result = await userCollection.insertOne(newUser);

          // Fetch the newly created user document by its insertedId
          const createdUser = await userCollection.findOne({ _id: result.insertedId });

          // Return the full user object to the frontend
          res.status(201).json(createdUser);
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    app.get('/users', async (req, res) => {

      const result = await userCollection.find().toArray();
      res.send(result)

    })
    //  Delete User  
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await userCollection.deleteOne(query);
      res.send(result)
    })
    // user role for Admin 
    app.patch('/users/admin/:id', async (req, res) => {

      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc);
      res.send(result)

    })
    app.get('/users/admin/:contact', async (req, res) => {
      const contact = req.params.contact;

      try {
        // Find the user by contact number
        const user = await userCollection.findOne({ contact });

        if (user) {
          // Return the admin status
          res.status(200).json({ admin: user.role === 'admin' });
        } else {
          res.status(404).json({ message: 'User not found' });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // drivers Colleaction

    app.get('/drivers', async (req, res) => {

      const result = await driverCollection.find().toArray();
      res.send(result)

    })

    app.get('/drivers/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await driverCollection.findOne(query).toArray();
      res.send(result)

    })
    app.delete('/drivers/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await driverCollection.deleteOne(query);
      res.send(result)
    })

    app.post('/drivers', async (req, res) => {
      const driver = req.body;
      const result = await driverCollection.insertOne(driver);
      res.send(result);
    })


    // Carts Collectioin

    app.get('/carts', async (req, res) => {
      const contact = req.query.contact;
      const query = { contact: contact };
      const result = await cartCollection.find(query).toArray();
      res.send(result);
    })
    app.post('/carts', async (req, res) => {
      const cartItem = req.body;
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
    })

    app.delete('/carts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await cartCollection.deleteOne(query);
      res.send(result)
    })
    // app.delete('/carts/:id', async (req, res) => {
    //   const id = req.params.id;
    //   const contact = req.query.contact; // Get user contact from query
    
    //   const query = { _id: new ObjectId(id), contact: contact }; // Match both item ID and contact
    //   const result = await cartCollection.deleteOne(query);
    
    //   if (result.deletedCount > 0) {
    //     res.send({ message: "Item removed", deletedCount: result.deletedCount });
    //   } else {
    //     res.status(404).send({ message: "Cart item not found" });
    //   }
    // });
    

    // categories

    app.get('/categories', async (req, res) => {
      const result = await categoriesCollection.find().toArray();
      res.send(result)
    })

    app.post('/categories', async (req, res) => {
      const categori = req.body;

      const result = await categoriesCollection.insertOne(categori);
      res.send(result)

    })


    // COMPANY INFORMATIONS

    app.get('/informations', async (req, res) => {
      try {
        const result = await informationCollection.find().toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch informations", error });
      }
    });

    app.get('/informations/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await informationCollection.findOne(query);
        if (result) {
          res.send(result);
        } else {
          res.status(404).send({ message: "Information not found" });
        }
      } catch (error) {
        res.status(500).send({ message: "Failed to fetch information", error });
      }
    });

    app.patch('/informations/:id', async (req, res) => {
      try {
        const Details = req.body;
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            companyName: Details.name,
            email: Details.email,
            phone: Details.phone,
            currency: Details.currency,
            address: Details.address,
            logoImage: Details.logoImage,  // Ensure this matches the field in frontend
            facebook: Details.facebook,
            twitter: Details.twitter,
            youtube: Details.youtube,
          }
        };
        const result = await informationCollection.updateOne(filter, updateDoc);
        if (result.matchedCount > 0) {
          res.send(result);
        } else {
          res.status(404).send({ message: "Information not found or no changes made" });
        }
      } catch (error) {
        res.status(500).send({ message: "Failed to update information", error });
      }
    });
    // BANNER COLLECTION

    app.post('/banners', async (req, res) => {
      try {
        const Banners = req.body;
        const result = await bannerCollection.insertOne(Banners);
        res.status(201).send(result);
      } catch (error) {
        res.status(500).send({ error: 'Failed to save banner' });
      }
    });

    app.get('/banners', async (req, res) => {
      const result = await bannerCollection.find().toArray();
      res.send(result)
    })

    app.delete('/banners/:id', async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) }
      const result = await bannerCollection.deleteOne(query);
      res.send(result)
    })

    app.get('/banners/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await bannerCollection.findOne(query)
      res.send(result)
    })

    app.patch('/banners/:id', async (req, res) => {
      const newBanner = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updateDoc = {
        $set: {
          bannerName: newBanner.bannerName,
          image: newBanner.image
        }
      };
      const result = await bannerCollection.updateOne(filter, updateDoc)
      res.send(result);
    })

    // ADMIN STATS 

    app.get('/admin-stats', async (req, res) => {

      const users = await userCollection.estimatedDocumentCount();
      const items = await itemCollection.estimatedDocumentCount();
      const oders = await oderCollection.estimatedDocumentCount();

      const result = await oderCollection.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$price"
            }
          }

        }
      ]).toArray();

      const revenue = result.length > 0 ? result[0].totalRevenue : 0;

      res.send({
        users,
        items,
        oders,
        revenue

      })
    })

   
  

    app.get('/oder-stats', async (req, res) => {
      const contact = req.query.contact; // Get the user's contact from the query parameter

      const result = await oderCollection.aggregate([
        {
          $match: { contact: contact } // Match orders for the specific user's contact
        },
        {
          $unwind: '$itemIds' // Unwind to get individual itemIds
        },
        {
          $addFields: {
            itemIds: { $toObjectId: '$itemIds' } // Convert string itemIds to ObjectId
          }
        },
        {
          $lookup: {
            from: 'items', // Join with the items collection
            localField: 'itemIds',
            foreignField: '_id',
            as: 'cardItems'
          }
        },
        {
          $unwind: '$cardItems' // Unwind to get individual cardItems (joined items)
        },
        {
          $group: {
            _id: '$cardItems._id', // Group by item ID
            itemName: { $first: '$cardItems.name' }, // Get the item name
            price: { $first: { $toDouble: '$cardItems.price' } }, // Convert price to double and get the item price
            image: { $first: '$cardItems.image' }, // Get the item image
            category: { $first: '$cardItems.category' }, // Optionally get the category
            quantity: { $sum: 1 }, // Sum the quantity
            totalRevenue: { $sum: { $toDouble: '$cardItems.price' } } // Sum the total revenue
          }
        },
        {
          $project: {
            _id: 0, // Exclude the _id field from the result
            itemName: 1, // Include the item name
            price: 1, // Include the price
            image: 1, // Include the image
            quantity: 1, // Include the quantity
            totalRevenue: 1 // Include the total revenue
          }
        }
      ]).toArray();

      res.send(result); // Send the result to the frontend
    });

   

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('shopinn is running')
})


app.listen(port, () => {
  console.log(`Online shopping is running on port ${port}`)
})