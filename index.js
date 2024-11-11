require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');

const url = 'http://books.toscrape.com';

async function scrapeData() {
  try {
    
    const { data } = await axios.get(url);
     
    const $ = cheerio.load(data);

    const livros = [];

    $('.product_pod').each((i, el) => {
      const titulo = $(el).find('h3 a').attr('title');
      const preco = $(el).find('.price_color').text();

      if (titulo && preco) {
        livros.push({ titulo, preco });
      }
    });

    return livros;
  } catch (error) {
    console.error("Erro ao acessar o site:", error);
    return [];
  }
}
async function sendEmail(content) {
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, 
      pass: process.env.EMAIL_PASS  
    }
  });

 const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'iaemersontorres@gmail.com', 
    subject: 'Livros e Preços - Books to Scrape',
    text: content.map(livro => `Título: ${livro.titulo}\nPreço: ${livro.preco}\n`).join('\n\n')
  };

  
  try {
    await transporter.sendMail(mailOptions);
    console.log('E-mail enviado com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar o e-mail:', error);
  }
}
async function main() {
  
  const livros = await scrapeData();

  if (livros.length > 0) {
    
    await sendEmail(livros);
  } else {
    console.log('Nenhum livro encontrado para enviar por e-mail.');
  }
}


main();
