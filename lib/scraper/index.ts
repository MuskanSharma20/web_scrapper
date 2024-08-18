import axios from 'axios';
import * as cheerio from 'cheerio';
import { extractCurrency, extractDescription, extractPrice } from '../utils';

export async function scrapeAmazonProduct(url:string) {
    
    if(!url) return;
    
    // curl --proxy brd.superproxy.io:22225 --proxy-user brd-customer-hl_69abf56f-zone-pricewise:o84twu9nkv9p -k "http://lumtest.com/myip.json"

 const userName=String(process.env.BRIGHTDATA_USERNAME);
 const password=String(process.env.BRIGHTDATA_PASSWORD);
 const port =22225;
 const sessionId = (1000000 * Math.random()) | 0;

 const options ={
    auth:{
        username:`${userName}-session-${sessionId}`,
        password,
    },
    host:`brd.superproxy.io`,         
    port,
    rejectUnauthorized:false,
 }

 try {
    //fetching product page
    const response = await axios.get(url,options);
   const $ =cheerio.load(response.data);

   const title=$('#productTitle').text().trim();

   const currentPrice=extractPrice(
      $('.priceToPay span.a-price-whole'),
      $('a.size.base.a-color-price'),
      $('.a-button-selected .a-color-base'),
     
   );

   const originalPrice=extractPrice(
      $('#priceblock_ourprice'),
      $('.a-price.a-text-price span.a-offscreen'),
      $('#listPrice'),
      $('#priceblock_dealprice'),
      $('.a-size-base.a-color-price')
   );

   const outOfStock = $('#availability span').text().trim().toLowerCase() === 'currently unavailable';

   const images = 
   $('#imgBlkFront').attr('data-a-dynamic-image') || 
   $('#landingImage').attr('data-a-dynamic-image') ||
   '{}'

   const imageUrls = Object.keys(JSON.parse(images));

   const currency = extractCurrency($('.a-price-symbol'))
   const discountRate = $('.savingsPercentage').text().replace(/[-%]/g, "");
   const description = extractDescription($)


   const data = {
      url,
      currency: currency,
      image: imageUrls[0],
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: Number(discountRate),
      category: 'category',
      isOutOfStock: outOfStock,
      description,
      lowestPrice:Number(currentPrice)||Number(originalPrice),
      highestPrice:Number(originalPrice)||Number(currentPrice),
      average:Number(currentPrice)||Number(originalPrice)
    }


    return data;
 } catch (error:any) {
    throw new Error(`Failed to scrape product:${error.message}`)
 }

}