import { prisma } from "../database/connectdb.js";
import bcrypt from "bcryptjs";

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
        ];

        for (const cat of categories) {
            await prisma.productCategory.upsert({
                where: { name: cat.name },
                update: { image: cat.image },
                create: cat
            });
        }

        res.status(201).json({ message: 'Categories created/synced' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}

export const uploadDataForMeasureUnits = async (req, res) => {
    try {
        const measureUnits = [
            { name: 'Lb' },
            { name: 'Unidad' },
            { name: 'Docena' },
            { name: 'Paquete' },
            { name: 'Arroba' },
            { name: 'Quintal' }
        ];

        for (const unit of measureUnits) {
            await prisma.measureUnit.upsert({
                where: { name: unit.name },
                update: {},
                create: unit
            });
        }

        res.status(201).json({ message: 'Measure Units created/synced' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}

export const uploadDataForProducts = async (req, res) => {
    try {
        // 1. Obtener o crear un Vendedor de prueba para asignar los productos
        let seller = await prisma.user.findFirst({ where: { role: "seller" } });
        if (!seller) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash("vendedor123", salt);
            seller = await prisma.user.create({
                data: {
                    username: "vendedor_demo",
                    email: "vendedor@demo.com",
                    phone: "70000000",
                    address: "San Salvador, El Salvador",
                    password: passwordHash,
                    lat: 13.6929,
                    lng: -89.2182,
                    role: "seller",
                    credit: 100.0
                }
            });
        }

        // 2. Obtener categorías y unidades mapeadas de Postgres
        const dbCategories = await prisma.productCategory.findMany();
        const dbUnits = await prisma.measureUnit.findMany();

        const findCategory = (name) => {
            const match = dbCategories.find(c => c.name.toLowerCase() === name.toLowerCase());
            return match ? match.id : dbCategories[0].id;
        };

        const findUnit = (name) => {
            const match = dbUnits.find(u => u.name.toLowerCase() === name.toLowerCase());
            return match ? match.id : dbUnits[0].id;
        };

        const products = [
            {
                name: 'Manzana',
                description: 'Manzana roja',
                price: 0.50,
                image: 'https://walmartsv.vtexassets.com/arquivos/ids/262930/Manzana-Roja-Gran-Un-1-2307.jpg?v=637970712944000000',
                categoryId: findCategory('Frutas'),
                measureUnitId: findUnit('Unidad'),
                stock: 10,
                quantity: 1,
                userId: seller.id
            },
            {
                name: 'Pera',
                description: 'Pera verde',
                price: 0.45,
                image: 'https://static.wixstatic.com/media/a7dee3_4c558736f7b243329c59427d855d278c~mv2.jpg/v1/fill/w_640,h_640,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/a7dee3_4c558736f7b243329c59427d855d278c~mv2.jpg',
                categoryId: findCategory('Frutas'),
                measureUnitId: findUnit('Unidad'),
                stock: 15,
                quantity: 1,
                userId: seller.id
            },
            {
                name: 'Naranja',
                description: 'Naranja amarilla',
                price: 0.30,
                image: 'https://ik.imagekit.io/plxxfr3casu/catalog/product/1/6/163172.jpg?tr=h-600',
                categoryId: findCategory('Frutas'),
                measureUnitId: findUnit('Unidad'),
                stock: 100,
                quantity: 1,
                userId: seller.id
            },
            {
                name: 'Papa',
                description: 'Papa blanca',
                price: 0.40,
                image: 'https://walmartsv.vtexassets.com/arquivos/ids/183851/Papa-Super-Libra-3-Unidades-Por-Lb-Aproximadamente-1-89.jpg?v=637644213610000000',
                categoryId: findCategory('Verduras'),
                measureUnitId: findUnit('Unidad'),
                stock: 25,
                quantity: 1,
                userId: seller.id
            },
            {
                name: 'Zanahoria',
                description: 'Zanahoria naranja',
                price: 0.80,
                image: 'https://d1cft8rz0k7w99.cloudfront.net/n/1/d/6/8/1d68c1d738187da47553f341142b74d112637406_196302_01.jpg',
                categoryId: findCategory('Verduras'),
                measureUnitId: findUnit('Unidad'),
                stock: 10,
                quantity: 1,
                userId: seller.id
            },
            {
                name: 'Lechuga',
                description: 'Lechuga verde',
                price: 1.00,
                image: 'https://walmartsv.vtexassets.com/arquivos/ids/228502/Lechuga-Arrepollada-Libra-1-Unidad-Por-Lb-Aproximadamente-1-116.jpg?v=637824479372130000',
                categoryId: findCategory('Verduras'),
                measureUnitId: findUnit('Unidad'),
                stock: 5,
                quantity: 1,
                userId: seller.id
            },
            {
                name: 'Pollo',
                description: 'Pollo blanco',
                price: 2.00,
                image: 'https://wongfood.vteximg.com.br/arquivos/ids/537798-1000-1000/Pollo-Entero-Fresco-Metro-x-kg-2-183284.jpg?v=637853935618030000',
                categoryId: findCategory('Carnes'),
                measureUnitId: findUnit('Lb'),
                stock: 5,
                quantity: 1,
                userId: seller.id
            },
            {
                name: 'Res',
                description: 'Res roja',
                price: 3.00,
                image: 'https://cdn.shopify.com/s/files/1/0571/7557/2638/products/RES58-1_7d85edfa-86a8-4dcd-b56e-30ac1a296c49.jpg?v=1627841553',
                categoryId: findCategory('Carnes'),
                measureUnitId: findUnit('Lb'),
                stock: 10,
                quantity: 1,
                userId: seller.id
            },
            {
                name: 'Queso',
                description: 'Queso blanco',
                price: 1.00,
                image: 'https://www.ingredion.com/content/dam/ingredion/mx-images/hero-desktop/AEM-Categories-Hero-Desktop-Cheese.jpg',
                categoryId: findCategory('Lacteos'),
                measureUnitId: findUnit('Lb'),
                stock: 15,
                quantity: 1,
                userId: seller.id
            },
            {
                name: 'Leche',
                description: 'Leche entera',
                price: 0.50,
                image: 'https://walmartsv.vtexassets.com/arquivos/ids/227471/Leche-Entera-Trebolac-UHT-Tetra-1000ml-2-10262.jpg?v=637818538061670000',
                categoryId: findCategory('Lacteos'),
                measureUnitId: findUnit('Lb'),
                stock: 20,
                quantity: 1,
                userId: seller.id
            },
            {
                name: 'Arroz',
                description: 'Arroz blanco',
                price: 0.50,
                image: 'https://tiaecuador.vtexassets.com/arquivos/ids/174300/259672000.jpg?v=637472939332800000',
                categoryId: findCategory('Cereales'),
                measureUnitId: findUnit('Lb'),
                stock: 30,
                quantity: 1,
                userId: seller.id
            },
            {
                name: 'Frijol',
                description: 'Frijol',
                price: 0.75,
                image: 'https://walmartsv.vtexassets.com/arquivos/ids/203137/Frijol-As-De-Oro-Rojo-Calidad-Exp-1816Gr-1-12010.jpg?v=637716694761500000',
                categoryId: findCategory('Granos'),
                measureUnitId: findUnit('Lb'),
                stock: 30,
                quantity: 1,
                userId: seller.id
            },
            {
                name: 'Cebolla',
                description: 'Cebolla blanca',
                price: 0.50,
                image: 'https://walmartsv.vtexassets.com/arquivos/ids/257258/Cebolla-Blanca-Libra-1-83.jpg?v=637932478470400000',
                categoryId: findCategory('Verduras'),
                measureUnitId: findUnit('Unidad'),
                stock: 30,
                quantity: 1,
                userId: seller.id
            },
            {
                name: 'Tomate',
                description: 'Tomate rojo',
                price: 0.50,
                image: 'https://www.elhuertodelabuelo.es/37/tomate-cana-andaluz.jpg',
                categoryId: findCategory('Verduras'),
                measureUnitId: findUnit('Unidad'),
                stock: 30,
                quantity: 1,
                userId: seller.id
            },
            {
                name: 'Pepino',
                description: 'Pepino verde',
                price: 0.50,
                image: 'https://www.laprensagrafica.com/__export/1508186157976/sites/prensagrafica/img/2017/10/16/pepinos_2.jpg_2062789929.jpg',
                categoryId: findCategory('Verduras'),
                measureUnitId: findUnit('Unidad'),
                stock: 30,
                quantity: 1,
                userId: seller.id
            },
            {
                name: 'Ajo',
                description: 'Ajo blanco',
                price: 0.50,
                image: 'https://t1.uc.ltmcdn.com/es/posts/7/9/2/cuales_son_los_beneficios_del_ajo_4297_orig.jpg',
                categoryId: findCategory('Verduras'),
                measureUnitId: findUnit('Unidad'),
                stock: 30,
                quantity: 1,
                userId: seller.id
            },
            {
                name: 'Cilantro',
                description: 'Cilantro verde',
                price: 0.50,
                image: 'https://i5.walmartimages.com/asr/e348344b-f499-43ab-8824-345ed3474766.2d103e10b2855c6e28cfa67f894b55c1.jpeg',
                categoryId: findCategory('Verduras'),
                measureUnitId: findUnit('Lb'),
                stock: 30,
                quantity: 1,
                userId: seller.id
            },
            {
                name: 'Papaya',
                description: 'Papaya amarilla',
                price: 0.50,
                image: 'https://i5.walmartimages.com/asr/f32e3da1-7d18-46ef-8c0a-04f973193469_1.b4adbba1b36ce3a1399a8d9c4781db8b.jpeg',
                categoryId: findCategory('Frutas'),
                measureUnitId: findUnit('Unidad'),
                stock: 30,
                quantity: 1,
                userId: seller.id
            }
        ];

        for (const prod of products) {
            await prisma.product.create({
                data: prod
            });
        }

        res.status(201).json({ message: 'Products created and assigned to vendedor_demo' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message })
    }
}