import { Category } from '../models/productCategory.js'
import { Product } from '../models/product.js'
import { MeasureUnit } from '../models/measureUnit.js'

export const uploadDataForCategories = async (req, res) => {
    try {
        const categories = [
            {
                name: 'Frutas',
                image: 'https://res.cloudinary.com/agromarket/image/upload/v1669658395/categorys/el-poder-de-las-frutas-libro_moahvm.jpg'
            },
            {
                name: 'Verduras',
                image: 'https://res.cloudinary.com/agromarket/image/upload/v1669658422/categorys/calendario-fruta-verduras-temporada-668x400x80xX-1_dwkgdl.jpg'
            },
            {
                name: 'Carnes',
                image: 'https://res.cloudinary.com/agromarket/image/upload/v1669658439/categorys/tipos-de-carne_-carnes-rojas-y-blancas_tw2z6n.png'
            },
            {
                name: 'Lacteos',
                image: 'https://res.cloudinary.com/agromarket/image/upload/v1669658460/categorys/1559132933_784891_1559133012_noticia_normal_recorte1_xwdeme.jpg'
            },
            {
                name: 'Cereales',
                image: 'https://res.cloudinary.com/agromarket/image/upload/v1669658487/categorys/cereales_pcjc6i.webp'
            },
            {
                name: 'Aceites',
                image: 'https://res.cloudinary.com/agromarket/image/upload/v1669658507/categorys/Aceite-vegetal-y-aceite-esencial-1024x682_gpk3ja.jpg'
            },
            {
                name: 'Granos',
                image: 'https://res.cloudinary.com/agromarket/image/upload/v1669658523/categorys/conjunto-diferentes-granos-enteros-frijoles-semillas-legumbres_73523-3388_q5neik.jpg'
            },
        ]
        await Category.insertMany(categories)
        res.status(201).json({ message: 'Categories created' })
    } catch (error) {
        res.status(500).json({ message: error.message })

    }
}

export const uploadDataForMeasureUnits = async (req, res) => {
    try {
        const measureUnits = [
            {
                name: 'Lb'
            },
            {
                name: 'Unidad'
            },
            {
                name: 'Docena'
            },
            {
                name: 'Paquete'
            },
            {
                name: 'Arroba'
            },
            {
                name: 'Quintal'
            }
        ]
        await MeasureUnit.insertMany(measureUnits)
        res.status(201).json({ message: 'Measure Units created' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const uploadDataForProducts = async (req, res) => {
    try {
        const products = [
            {
                name: 'Manzana',
                description: 'Manzana roja',
                price: 0.50,
                image: 'https://walmartsv.vtexassets.com/arquivos/ids/262930/Manzana-Roja-Gran-Un-1-2307.jpg?v=637970712944000000',
                category: '638286159a9cb12e08c5841e',
                measureUnit: '638286199a9cb12e08c58427',
                stock: 10,
                quantity: 1
            },
            {
                name: 'Pera',
                description: 'Pera verde',
                price: 0.45,
                image: 'https://static.wixstatic.com/media/a7dee3_4c558736f7b243329c59427d855d278c~mv2.jpg/v1/fill/w_640,h_640,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/a7dee3_4c558736f7b243329c59427d855d278c~mv2.jpg',
                category: '638286159a9cb12e08c5841e',
                measureUnit: '638286199a9cb12e08c58427',
                stock: 15,
                quantity: 1
            },
            {
                name: 'Naranja',
                description: 'Naranja amarilla',
                price: 0.30,
                image: 'https://ik.imagekit.io/plxxfr3casu/catalog/product/1/6/163172.jpg?tr=h-600',
                category: '638286159a9cb12e08c5841e',
                measureUnit: '638286199a9cb12e08c58427',
                stock: 100,
                quantity: 1
            },
            {
                name: 'Papa',
                description: 'Papa blanca',
                price: 0.40,
                image: 'https://walmartsv.vtexassets.com/arquivos/ids/183851/Papa-Super-Libra-3-Unidades-Por-Lb-Aproximadamente-1-89.jpg?v=637644213610000000',
                category: '638286159a9cb12e08c5841f',
                measureUnit: '638286199a9cb12e08c58427',
                stock: 25,
                quantity: 1
            },
            {
                name: 'Zanahoria',
                description: 'Zanahoria naranja',
                price: 0.80,
                image: 'https://d1cft8rz0k7w99.cloudfront.net/n/1/d/6/8/1d68c1d738187da47553f341142b74d112637406_196302_01.jpg',
                category: '638286159a9cb12e08c5841f',
                measureUnit: '638286199a9cb12e08c58427',
                stock: 10,
                quantity: 1
            },
            {
                name: 'Lechuga',
                description: 'Lechuga verde',
                price: 1.00,
                image: 'https://walmartsv.vtexassets.com/arquivos/ids/228502/Lechuga-Arrepollada-Libra-1-Unidad-Por-Lb-Aproximadamente-1-116.jpg?v=637824479372130000',
                category: '638286159a9cb12e08c5841f',
                measureUnit: '638286199a9cb12e08c58427',
                stock: 5,
                quantity: 1
            },
            {
                name: 'Pollo',
                description: 'Pollo blanco',
                price: 2.00,
                image: 'https://wongfood.vteximg.com.br/arquivos/ids/537798-1000-1000/Pollo-Entero-Fresco-Metro-x-kg-2-183284.jpg?v=637853935618030000',
                category: '638286159a9cb12e08c58420',
                measureUnit: '638286199a9cb12e08c58426',
                stock: 5,
                quantity: 1
            },
            {
                name: 'Res',
                description: 'Res roja',
                price: 3.00,
                image: 'https://cdn.shopify.com/s/files/1/0571/7557/2638/products/RES58-1_7d85edfa-86a8-4dcd-b56e-30ac1a296c49.jpg?v=1627841553',
                category: '638286159a9cb12e08c58420',
                measureUnit: '638286199a9cb12e08c58426',
                stock: 10,
                quantity: 1
            },
            {
                name: 'Queso',
                description: 'Queso blanco',
                price: 1.00,
                image: 'https://www.ingredion.com/content/dam/ingredion/mx-images/hero-desktop/AEM-Categories-Hero-Desktop-Cheese.jpg',
                category: '638286159a9cb12e08c58421',
                measureUnit: '638286199a9cb12e08c58426',
                stock: 15,
                quantity: 1
            },
            {
                name: 'Leche',
                description: 'Leche entera',
                price: 0.50,
                image: 'https://walmartsv.vtexassets.com/arquivos/ids/227471/Leche-Entera-Trebolac-UHT-Tetra-1000ml-2-10262.jpg?v=637818538061670000',
                category: '638286159a9cb12e08c58421',
                measureUnit: '638286199a9cb12e08c58426',
                stock: 20,
                quantity: 1
            },
            {
                name: 'Arroz',
                description: 'Arroz blanco',
                price: 0.50,
                image: 'https://tiaecuador.vtexassets.com/arquivos/ids/174300/259672000.jpg?v=637472939332800000',
                category: '638286159a9cb12e08c58424',
                measureUnit: '638286199a9cb12e08c58426',
                stock: 30,
                quantity: 1
            },
            {
                name: 'Frijol',
                description: 'Frijol',
                price: 0.75,
                image: 'https://walmartsv.vtexassets.com/arquivos/ids/203137/Frijol-As-De-Oro-Rojo-Calidad-Exp-1816Gr-1-12010.jpg?v=637716694761500000',
                category: '638286159a9cb12e08c58424',
                measureUnit: '638286199a9cb12e08c58426',
                stock: 30,
                quantity: 1
            },
            {
                name: 'Cebolla',
                description: 'Cebolla blanca',
                price: 0.50,
                image: 'https://walmartsv.vtexassets.com/arquivos/ids/257258/Cebolla-Blanca-Libra-1-83.jpg?v=637932478470400000',
                category: '638286159a9cb12e08c5841f',
                measureUnit: '638286199a9cb12e08c58427',
                stock: 30,
                quantity: 1
            },
            {
                name: 'Tomate',
                description: 'Tomate rojo',
                price: 0.50,
                image: 'https://www.elhuertodelabuelo.es/37/tomate-cana-andaluz.jpg',
                category: '638286159a9cb12e08c5841f',
                measureUnit: '638286199a9cb12e08c58427',
                stock: 30,
                quantity: 1
            },
            {
                name: 'Pepino',
                description: 'Pepino verde',
                price: 0.50,
                image: 'https://www.laprensagrafica.com/__export/1508186157976/sites/prensagrafica/img/2017/10/16/pepinos_2.jpg_2062789929.jpg',
                category: '638286159a9cb12e08c5841f',
                measureUnit: '638286199a9cb12e08c58427',
                stock: 30,
                quantity: 1
            },
            {
                name: 'Ajo',
                description: 'Ajo blanco',
                price: 0.50,
                image: 'https://t1.uc.ltmcdn.com/es/posts/7/9/2/cuales_son_los_beneficios_del_ajo_4297_orig.jpg',
                category: '638286159a9cb12e08c5841f',
                measureUnit: '638286199a9cb12e08c58427',
                stock: 30,
                quantity: 1
            },
            {
                name: 'Cilantro',
                description: 'Cilantro verde',
                price: 0.50,
                image: 'https://i5.walmartimages.com/asr/e348344b-f499-43ab-8824-345ed3474766.2d103e10b2855c6e28cfa67f894b55c1.jpeg',
                category: '638286159a9cb12e08c5841f',
                measureUnit: '638286199a9cb12e08c58426',
                stock: 30,
                quantity: 1
            },
            {
                name: 'Papaya',
                description: 'Papaya amarilla',
                price: 0.50,
                image: 'https://i5.walmartimages.com/asr/f32e3da1-7d18-46ef-8c0a-04f973193469_1.b4adbba1b36ce3a1399a8d9c4781db8b.jpeg',
                category: '638286159a9cb12e08c5841e',
                measureUnit: '638286199a9cb12e08c58427',
                stock: 30,
                quantity: 1
            }
        ]
        await Product.insertMany(products)
        res.status(201).json({ message: 'Products created' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}