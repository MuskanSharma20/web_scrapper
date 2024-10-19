"use server"

import { revalidatePath } from "next/cache";
import { scrapeAmazonProduct } from "../scraper"; //importing scraped data from index.ts which is in scraper
import { connectToDb } from "../mongoose";
import Product from "../models/product.model";
import { getAveragePrice, getHighestPrice, getLowestPrice } from "../utils";
import { User } from "@/types/type";
import { generateEmailBody, sendEmail } from "../nodemailer";
// import { generateEmailBody, sendEmail } from "../nodemailer";



export async function scrapeAndStoreProduct(productUrl:string){

    if(!productUrl) return;

    try {
connectToDb();
        const scrapedProduct =await scrapeAmazonProduct(productUrl);

        if(!scrapedProduct) return;

        let product=scrapedProduct;  // Initializes product with the scraped data. Checks if the product already exists in the database using the product URL.
  
        const existingProduct=await Product.findOne({url:scrapedProduct.url});

        //updating price history
        if(existingProduct) {  
            const updatedPriceHistory: any = [
              ...existingProduct.priceHistory,     
              { price: scrapedProduct.currentPrice }
            ]
      
            product = {
              ...scrapedProduct,
              priceHistory: updatedPriceHistory,
              lowestPrice: getLowestPrice(updatedPriceHistory),
              highestPrice: getHighestPrice(updatedPriceHistory),
              averagePrice: getAveragePrice(updatedPriceHistory),
            }
          }

          const newProduct = await Product.findOneAndUpdate(
            { url: scrapedProduct.url },
            product,
            { upsert: true, new: true }
          );
      

        //   After updating or creating the product, the revalidatePath function is called to refresh the specific product page, ensuring that the latest data is displayed.


          revalidatePath(`/products/${newProduct._id}`);

        } catch (error: any) {
          throw new Error(`Failed to create/update product: ${error.message}`)
        }
}


// getting product id
export async function getProductById(productId: string) {
    try {
      connectToDb();
  
      const product = await Product.findOne({ _id: productId });
  
      if(!product) return null;
  
      return product;
    } catch (error) {
      console.log(error);
    }
  }
  
  // getting all products
  export async function getAllProducts() {
    try {
      connectToDb();
  
      const products = await Product.find();
  
      return products;
    } catch (error) {
      console.log(error);
    }
  }


  //getting similar products
  export async function getSimilarProducts(productId: string) {
    try {
      connectToDb();
  
      const currentProduct = await Product.findById(productId);
  
      if(!currentProduct) return null;
  
      const similarProducts = await Product.find({
        _id: { $ne: productId },
      }).limit(3);
  
      return similarProducts;
    } catch (error) {
      console.log(error);
    }
  }
  

  export async function addUserEmailToProduct(productId: string, userEmail: string) {
    try {
  //send our first email
      const product = await Product.findById(productId);
  
      if(!product) return;
  
      const userExists = product.users.some((user: User) => user.email === userEmail);
  
      if(!userExists) {
        product.users.push({ email: userEmail });
  
        await product.save();
  
         const emailContent = await generateEmailBody(product, "WELCOME");
  
         await sendEmail(emailContent, [userEmail]);
      }
    } catch (error) {
      console.log(error);
    }
  }