require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Supplier = require('./models/Supplier');
const Purchase = require('./models/Purchase');
const Product = require('./models/Product');
const Category = require('./models/Category');

// ── ALL 100 Real Suppliers ─────────────────────────────────────────────────────
const SUPPLIERS = [
  { supplierId: 'SP0121', name: 'Kumudu Walsapugala', mobile: '0772697571', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0120', name: 'Nimal Buruthankanda', mobile: '0779327826', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0119', name: 'Ajith TJC', mobile: '0771557031', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0118', name: 'Lahiru Thelawilla', mobile: '0705324810', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0117', name: 'Hasindu Beragama', mobile: '0719076144', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0116', name: 'Jayaweera phol 5', mobile: '0761743638', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0115', name: 'Upul madampella', mobile: null, purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0114', name: 'Priyantha Cavendish', mobile: '0725033366', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0113', name: 'Chanaka', mobile: '0777689067', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0112', name: 'Darshana Aluthgan Aara', mobile: '0776398829', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0111', name: 'Prasanna Kudaa Oya', mobile: '0760577809', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0110', name: 'Dimuthu H M D Traders', mobile: '0770288601', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0109', name: 'Ajith Lunama', mobile: '0771489322', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0108', name: 'Mahatthuru Ayya', mobile: '0774434244', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0107', name: 'Hichchi Ayya', mobile: null, purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0106', name: 'Sunil Beragama', mobile: '0719368722', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0105', name: 'ran ayya kurulu uyana', mobile: '0779742885', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0104', name: 'Chandana Cavendish', mobile: '0773751165', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0103', name: 'Nuwan kk', mobile: '715163293', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0102', name: 'Galappatthi', mobile: null, purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0101', name: 'Senaka Ambalanthota', mobile: '0704464473', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0100', name: 'S A indika Dehigahalandha', mobile: '0771174048', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0099', name: 'Hithasha Fruits', mobile: null, purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0098', name: 'Sugath Beragama', mobile: '0714580390', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0097', name: 'Jayathunga Bolaana', mobile: '0765581207', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0096', name: 'Tikiri Ayya', mobile: null, purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0095', name: 'Shehan Beragama', mobile: null, purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0094', name: 'Milan Beragama', mobile: '0715704163', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0093', name: 'Sithum Malli', mobile: null, purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0092', name: 'Weerasinghe Beragama', mobile: null, purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0091', name: 'Tharaka Beragama', mobile: '0779191516', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0090', name: 'Linton Beragama', mobile: '0774366569', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0089', name: 'Raveendra Thissapura', mobile: '0774300032', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0088', name: 'Sisira Sooriyawewa', mobile: '0766396665', purchaseDue: -2000, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0087', name: 'Raja Buruthankanda', mobile: null, purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0086', name: 'Mahathun Buruthankanda', mobile: '0762670771', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0085', name: 'Jeewantha Sooriyawewa', mobile: '0718382987', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0084', name: 'Baby Walsapugala', mobile: '0774167414', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0083', name: 'Chaminda Buruthenkanda', mobile: '0719777203', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0082', name: 'Rumesh Thelawilla', mobile: '0711411025', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0081', name: 'Vije Mama', mobile: null, purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0080', name: 'Shanika Akkara 50', mobile: null, purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0079', name: 'Tharaka Mayurapura', mobile: '0703567542', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0078', name: 'Thilak Ayya', mobile: '0712879169', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0077', name: 'Ukkun Ayya', mobile: null, purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0076', name: 'Rambuka Gamini', mobile: null, purchaseDue: 132520, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0075', name: 'Dasun Bolaana', mobile: '0712828386', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0074', name: 'Darmasena Sooriyawewa', mobile: '0710917050', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0073', name: 'Steewan', mobile: '0716666249', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0072', name: 'Gamini Buruthankanda', mobile: '0716095657', purchaseDue: 425470, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0071', name: 'Chandrasena Buruthankanda', mobile: '0772168253', purchaseDue: 70280, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0070', name: 'Wasantha Hondawelpokuna', mobile: '0765865430', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0069', name: 'Suranga Sooriyawewa KK', mobile: '0715573682', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0068', name: 'Nadeera Sooriyawewa KK', mobile: '0773075314', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0067', name: 'Sujeewa Sooriyawewa', mobile: '0776925785', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0066', name: 'Sunil KK Sooriyawewa', mobile: '0712297967', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0065', name: 'Nikaweratiya Melon', mobile: null, purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0064', name: 'Sooriyawewa Melon', mobile: '0765654267', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0063', name: 'Samantha Walsapugala', mobile: '0715740500', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0062', name: 'Janaka Sooriyawewa', mobile: '0762838795', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0061', name: 'Harsha Hambanthota', mobile: '0754201091', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0060', name: 'Ranjith Beragama', mobile: '0764114823', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0059', name: 'Dammika Sooriyawewa', mobile: '0774549613', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0058', name: 'Sugath Mama', mobile: '0774206943', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0057', name: 'Premasiri', mobile: null, purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0056', name: 'Damith Walewattha', mobile: '0711205026', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0055', name: 'Chathuranga Walewattha', mobile: '0712143380', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0054', name: 'Dinushka Malli', mobile: '0768451342', purchaseDue: 32910, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0053', name: 'Sanjeewa Sooriyawewa', mobile: '0769624726', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0052', name: 'Dimuthu Passion Fruit', mobile: null, purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0051', name: 'Self', mobile: null, purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0050', name: 'Kalu Mama', mobile: null, purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0049', name: 'Iokkayya', mobile: null, purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0048', name: 'Amila Beragama', mobile: '0740382103', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0047', name: 'Eman Ayya Ambalanthota', mobile: '0713368775', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0046', name: 'Nimal Ayya Ambalanthota', mobile: '0768091853', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0045', name: 'passion', mobile: null, purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0044', name: 'Suresh ( V )', mobile: '0715980048', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0043', name: 'Dhulaj ( V )', mobile: '0715698313', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0042', name: 'Keshara ( V )', mobile: '0774302233', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0041', name: 'Indika', mobile: null, purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0040', name: 'Ajith Marawila', mobile: null, purchaseDue: 2800, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0039', name: 'Chaminda Beragama', mobile: '0715856454', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0038', name: 'Sudu Malli Walewattha', mobile: '0779602346', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0037', name: 'Chanaka Ambalanthota', mobile: '0778460932', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0036', name: 'Viraj Malli', mobile: null, purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0035', name: 'Rorshan', mobile: null, purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0034', name: 'Sachin Thelawilla', mobile: '0740299700', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0033', name: 'Dharmawardhana (Ayya Sudhuayya)', mobile: '0761757442', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0032', name: 'KBR F F', mobile: null, purchaseDue: 15450, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0031', name: 'Mr Ranga', mobile: '0773618488', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0030', name: 'Sudu Ayya U D 8', mobile: '0776427839', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0029', name: 'Pati Mama', mobile: null, purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0028', name: 'Saman (Pataka)', mobile: '0719342611', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0027', name: 'Sudhu Malli (Laasen)', mobile: null, purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0026', name: 'Indika 99', mobile: '0771433406', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0025', name: 'Sudhu Ayya', mobile: null, purchaseDue: 29920, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0024', name: 'Jayantha Ayya Walewattha', mobile: '0779844780', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0023', name: 'Nishanthi Akk', mobile: '0703639154', purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
  { supplierId: 'SP0022', name: 'Sanath Malli', mobile: null, purchaseDue: 0, purchaseReturnDue: 0, status: 'Active' },
];

// ── All 65 Real Purchase Orders ────────────────────────────────────────────────
const PURCHASES = [
  { purchaseDate: '2026-07-29', purchaseCode: 'PU1065', supplierName: 'Tikiri Ayya', total: 62310, paidPayment: 62310, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-29', purchaseCode: 'PU1064', supplierName: 'Kumudu Walsapugala', total: 103320, paidPayment: 103320, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-29', purchaseCode: 'PU1063', supplierName: 'Lahiru Thelawilla', total: 44650, paidPayment: 44650, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-26', purchaseCode: 'PU1062', supplierName: 'Chandrasena Buruthankanda', total: 27710, paidPayment: 27710, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-26', purchaseCode: 'PU1061', supplierName: 'Mahathun Buruthankanda', total: 48200, paidPayment: 48200, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-29', purchaseCode: 'PU1060', supplierName: 'Nimal Buruthankanda', total: 182580, paidPayment: 182580, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-29', purchaseCode: 'PU1059', supplierName: 'Hasindu Beragama', total: 29260, paidPayment: 29260, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-29', purchaseCode: 'PU1058', supplierName: 'Chanaka', total: 58200, paidPayment: 58200, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-29', purchaseCode: 'PU1057', supplierName: 'Linton Beragama', total: 153720, paidPayment: 153720, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-24', purchaseCode: 'PU1056', supplierName: 'KBR F F', total: 15450, paidPayment: 0, due: 15450, status: 'Received', paymentStatus: 'Unpaid' },
  { purchaseDate: '2026-07-22', purchaseCode: 'PU1055', supplierName: 'Dimuthu H M D Traders', total: 48020, paidPayment: 48020, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-22', purchaseCode: 'PU1054', supplierName: 'Lahiru Thelawilla', total: 69120, paidPayment: 69120, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-22', purchaseCode: 'PU1053', supplierName: 'Kumudu Walsapugala', total: 48300, paidPayment: 48300, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-22', purchaseCode: 'PU1052', supplierName: 'Nimal Buruthankanda', total: 185370, paidPayment: 185370, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-22', purchaseCode: 'PU1051', supplierName: 'Dinushka Malli', total: 32910, paidPayment: 0, due: 32910, status: 'Received', paymentStatus: 'Unpaid' },
  { purchaseDate: '2026-07-22', purchaseCode: 'PU1050', supplierName: 'Linton Beragama', total: 519640, paidPayment: 519640, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-17', purchaseCode: 'PU1049', supplierName: 'KBR F F', total: 56250, paidPayment: 56250, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-05-15', purchaseCode: 'PU1048', supplierName: 'Sisira Sooriyawewa', total: 46100, paidPayment: 46100, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-15', purchaseCode: 'PU1047', supplierName: 'Tikiri Ayya', total: 34690, paidPayment: 34690, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-15', purchaseCode: 'PU1046', supplierName: 'Kumudu Walsapugala', total: 78650, paidPayment: 78650, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-15', purchaseCode: 'PU1045', supplierName: 'Chandrasena Buruthankanda', total: 11750, paidPayment: 11750, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-15', purchaseCode: 'PU1044', supplierName: 'Gamini Buruthankanda', total: 11990, paidPayment: 11990, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-15', purchaseCode: 'PU1043', supplierName: 'Mahathun Buruthankanda', total: 48700, paidPayment: 48700, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-15', purchaseCode: 'PU1042', supplierName: 'Lahiru Thelawilla', total: 36220, paidPayment: 36220, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-15', purchaseCode: 'PU1041', supplierName: 'Nimal Buruthankanda', total: 120935, paidPayment: 120935, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-15', purchaseCode: 'PU1040', supplierName: 'Linton Beragama', total: 384010, paidPayment: 384010, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-10', purchaseCode: 'PU1039', supplierName: 'KBR F F', total: 31850, paidPayment: 31850, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-08-07', purchaseCode: 'PU1038', supplierName: 'Mahathun Buruthankanda', total: 19800, paidPayment: 19800, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-08-07', purchaseCode: 'PU1037', supplierName: 'Chandrasena Buruthankanda', total: 18150, paidPayment: 18150, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-08-07', purchaseCode: 'PU1036', supplierName: 'Lahiru Thelawilla', total: 42100, paidPayment: 42100, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-08-07', purchaseCode: 'PU1035', supplierName: 'Kumudu Walsapugala', total: 41000, paidPayment: 41000, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-08-07', purchaseCode: 'PU1034', supplierName: 'Nimal Buruthankanda', total: 77300, paidPayment: 77300, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-08-07', purchaseCode: 'PU1033', supplierName: 'Dimuthu H M D Traders', total: 1800, paidPayment: 1800, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-08-07', purchaseCode: 'PU1032', supplierName: 'Ajith TJC', total: 28000, paidPayment: 28000, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-08-07', purchaseCode: 'PU1031', supplierName: 'Prasanna Kudas Oya', total: 169680, paidPayment: 169680, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-08-07', purchaseCode: 'PU1030', supplierName: 'Linton Beragama', total: 302730, paidPayment: 302730, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-03', purchaseCode: 'PU1029', supplierName: 'KBR F F', total: 28755, paidPayment: 28755, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-01', purchaseCode: 'PU1028', supplierName: 'Iokkayya', total: 12100, paidPayment: 12100, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-01', purchaseCode: 'PU1027', supplierName: 'Tikiri Ayya', total: 3550, paidPayment: 3550, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-01', purchaseCode: 'PU1026', supplierName: 'Sisira Sooriyawewa', total: 176770, paidPayment: 176770, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-01', purchaseCode: 'PU1025', supplierName: 'Chandrasena Buruthankanda', total: 11140, paidPayment: 11140, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-01', purchaseCode: 'PU1024', supplierName: 'Ran Malli', total: 25860, paidPayment: 25860, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-01', purchaseCode: 'PU1023', supplierName: 'Mahathun Buruthankanda', total: 60630, paidPayment: 60630, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-01', purchaseCode: 'PU1022', supplierName: 'Lahiru Thelawilla', total: 101370, paidPayment: 101370, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-01', purchaseCode: 'PU1021', supplierName: 'Baby Ayya', total: 177210, paidPayment: 177210, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-07-01', purchaseCode: 'PU1020', supplierName: 'Linton Beragama', total: 280440, paidPayment: 280440, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-06-26', purchaseCode: 'PU1019', supplierName: 'KBR F F', total: 27690, paidPayment: 27690, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-06-26', purchaseCode: 'PU1018', supplierName: 'Lahiru Thelawilla', total: 97680, paidPayment: 97680, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-06-25', purchaseCode: 'PU1017', supplierName: 'Gamini Buruthankanda', total: 12600, paidPayment: 12600, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-06-25', purchaseCode: 'PU1016', supplierName: 'Chandrasena Buruthankanda', total: 37380, paidPayment: 37380, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-06-25', purchaseCode: 'PU1015', supplierName: 'Sudhu Malli (Laasen)', total: 171840, paidPayment: 171840, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-06-25', purchaseCode: 'PU1014', supplierName: 'Chanaka', total: 189660, paidPayment: 189660, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-06-21', purchaseCode: 'PU1013', supplierName: 'Exses', total: 62, paidPayment: 62, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-06-19', purchaseCode: 'PU1012', supplierName: 'KBR F F', total: 33440, paidPayment: 33440, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-06-17', purchaseCode: 'PU1011', supplierName: 'Iokkayya', total: 39890, paidPayment: 39890, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-06-17', purchaseCode: 'PU1010', supplierName: 'Gamini Buruthankanda', total: 9500, paidPayment: 9500, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-06-17', purchaseCode: 'PU1009', supplierName: 'Chandrasena Buruthankanda', total: 35320, paidPayment: 35320, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-06-17', purchaseCode: 'PU1008', supplierName: 'Tikiri Ayya', total: 42830, paidPayment: 42830, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-06-17', purchaseCode: 'PU1007', supplierName: 'Jayaweera phol 5', total: 28460, paidPayment: 28460, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-06-17', purchaseCode: 'PU1006', supplierName: 'Baby Ayya', total: 206850, paidPayment: 206850, due: 0, status: 'Received', paymentStatus: 'Paid' },
  { purchaseDate: '2026-06-17', purchaseCode: 'PU1005', supplierName: 'Samantha', total: 3040, paidPayment: 3040, due: 0, status: 'Received', paymentStatus: 'Paid' },
];

// ── All 35 products (same as before) ──────────────────────────────────────────
const PRODUCT_DATA = [
  { itemCode: 'IT0001', name: 'Banana Sour No.1', description: 'Ambul Kesel No.1 — Premium Grade 1 sour banana from Negombo farms.', category: 'Banana', unit: 'kg', stockQuantity: 150, purchasePrice: 140, retailPrice: 200, wholesalePrice: 175, image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80' },
  { itemCode: 'IT0002', name: 'Banana KK', description: 'Kolikuttu — sweet creamy Sri Lankan banana variety.', category: 'Banana', unit: 'kg', stockQuantity: 120, purchasePrice: 340, retailPrice: 410, wholesalePrice: 380, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80' },
  { itemCode: 'IT0003', name: 'Banana Sour No.2', description: 'Ambul Kesel No.2 — Grade 2 sour banana, ideal for curries.', category: 'Banana', unit: 'kg', stockQuantity: 100, purchasePrice: 90, retailPrice: 140, wholesalePrice: 125, image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80' },
  { itemCode: 'IT0004', name: 'Banana KK No.2', description: 'Kolikuttu No.2 — Grade 2 Kolikuttu for smoothies and desserts.', category: 'Banana', unit: 'kg', stockQuantity: 100, purchasePrice: 200, retailPrice: 300, wholesalePrice: 270, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80' },
  { itemCode: 'IT0005', name: 'Puwalu Banana', description: 'Puwalu — small sweet banana, used in ceremonies.', category: 'Banana', unit: 'kg', stockQuantity: 80, purchasePrice: 80, retailPrice: 150, wholesalePrice: 130, image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80' },
  { itemCode: 'IT0006', name: 'Banana Red', description: 'Rath Kesel — vibrant red banana with raspberry hint, rich in antioxidants.', category: 'Banana', unit: 'kg', stockQuantity: 60, purchasePrice: 340, retailPrice: 400, wholesalePrice: 370, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Red_bananas.jpg/800px-Red_bananas.jpg' },
  { itemCode: 'IT0007', name: 'Banana (Regular)', description: 'Kesel — fresh local yellow banana, a daily essential.', category: 'Banana', unit: 'kg', stockQuantity: 200, purchasePrice: 150, retailPrice: 180, wholesalePrice: 165, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80' },
  { itemCode: 'IT0008', name: 'Banana Sour Special', description: 'Ambul Kesel Special — premium hand-picked sour bananas for curries.', category: 'Banana', unit: 'kg', stockQuantity: 80, purchasePrice: 150, retailPrice: 210, wholesalePrice: 190, image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80' },
  { itemCode: 'IT0010', name: 'Eithral (Bottle Gourd)', description: 'Alu — traditional Sri Lankan bottle gourd for curries and soups.', category: 'OTHERS', unit: 'unit', stockQuantity: 20, purchasePrice: 410, retailPrice: 600, wholesalePrice: 540, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Bottle_gourd.jpg/800px-Bottle_gourd.jpg' },
  { itemCode: 'IT0011', name: 'Melon Rocky 475 No.2', description: 'Rock Melon Grade 2 — juicy and refreshing cantaloupe.', category: 'Fruit', unit: 'kg', stockQuantity: 50, purchasePrice: 35, retailPrice: 40, wholesalePrice: 36, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Cantaloupe_and_cross_section.jpg/800px-Cantaloupe_and_cross_section.jpg' },
  { itemCode: 'IT0012', name: 'Melon Tornaa', description: 'Tornaa Melon — sweet golden melon, great for fruit salads.', category: 'Fruit', unit: 'kg', stockQuantity: 50, purchasePrice: 100, retailPrice: 140, wholesalePrice: 125, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Cantaloupe_and_cross_section.jpg/800px-Cantaloupe_and_cross_section.jpg' },
  { itemCode: 'IT0013', name: 'Kuruluthuda Rice', description: 'Kuruluthuda Hal — traditional Sri Lankan heritage rice.', category: 'OTHERS', unit: 'kg', stockQuantity: 100, purchasePrice: 350, retailPrice: 390, wholesalePrice: 360, image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&w=600&q=80' },
  { itemCode: 'IT0014', name: 'Red Rice', description: 'Rathu Hal — nutritious traditional red rice, rich in fibre.', category: 'OTHERS', unit: 'kg', stockQuantity: 100, purchasePrice: 190, retailPrice: 210, wholesalePrice: 195, image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=600&q=80' },
  { itemCode: 'IT0015', name: 'Banana Green', description: 'Kesel Kola — fresh green bananas for cooking and plantain dishes.', category: 'Banana', unit: 'kg', stockQuantity: 70, purchasePrice: 220, retailPrice: 0, wholesalePrice: 0, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Green_bananas_2.jpg/800px-Green_bananas_2.jpg' },
  { itemCode: 'IT0016', name: 'Mango TJC', description: 'TJC Mango — premium quality large yellow mango, extremely sweet.', category: 'Fruit', unit: 'kg', stockQuantity: 80, purchasePrice: 280, retailPrice: 330, wholesalePrice: 305, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Mango_and_cross_section_edit.jpg/800px-Mango_and_cross_section_edit.jpg' },
  { itemCode: 'IT0017', name: 'Soursop', description: 'Katu Anoda — tropical soursop with creamy white pulp, rich in Vitamin C.', category: 'Fruit', unit: 'kg', stockQuantity: 40, purchasePrice: 50, retailPrice: 150, wholesalePrice: 130, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Soursop%2C_Annona_muricata.jpg/800px-Soursop%2C_Annona_muricata.jpg' },
  { itemCode: 'IT0018', name: 'Cavendish Banana', description: 'Cavendish — premium export-quality banana, perfectly yellow.', category: 'Banana', unit: 'kg', stockQuantity: 120, purchasePrice: 110, retailPrice: 150, wholesalePrice: 135, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80' },
  { itemCode: 'IT0019', name: 'Custard Apple', description: 'Seetha — custard apple with sweet creamy flesh. Also called sugar apple.', category: 'Fruit', unit: 'kg', stockQuantity: 30, purchasePrice: 70, retailPrice: 150, wholesalePrice: 130, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Sugar_apple_with_leaves.jpg/800px-Sugar_apple_with_leaves.jpg' },
  { itemCode: 'IT0020', name: 'Wood Apple', description: 'Divul — hard-shelled Sri Lankan wood apple with tangy sweet pulp.', category: 'Fruit', unit: 'kg', stockQuantity: 40, purchasePrice: 100, retailPrice: 150, wholesalePrice: 130, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Wood_apple_2.jpg/800px-Wood_apple_2.jpg' },
  { itemCode: 'IT0021', name: 'Passion Fruit', description: 'Passion — tropical passion fruit with aromatic pulp, rich in antioxidants.', category: 'Fruit', unit: 'kg', stockQuantity: 50, purchasePrice: 300, retailPrice: 400, wholesalePrice: 370, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Passion_fruit_-_whole_and_halved.jpg/800px-Passion_fruit_-_whole_and_halved.jpg' },
  { itemCode: 'IT0022', name: 'Brinjal (Eggplant)', description: 'Wambatu — Sri Lankan purple brinjal, essential in curries and sambols.', category: 'Vegetable', unit: 'kg', stockQuantity: 80, purchasePrice: 200, retailPrice: 220, wholesalePrice: 205, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Solanum_melongena_24_08_2012.JPG/800px-Solanum_melongena_24_08_2012.JPG' },
  { itemCode: 'IT0023', name: 'Beans Long', description: 'Mae Karal — fresh long yard beans. A Sri Lankan staple vegetable.', category: 'Vegetable', unit: 'kg', stockQuantity: 60, purchasePrice: 110, retailPrice: 160, wholesalePrice: 145, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Yardlong_bean.jpg/800px-Yardlong_bean.jpg' },
  { itemCode: 'IT0024', name: 'Drumstick (Murunga)', description: 'Murunga — drumstick/moringa pods. Highly nutritious, used in curries and dhal.', category: 'Vegetable', unit: 'kg', stockQuantity: 50, purchasePrice: 60, retailPrice: 100, wholesalePrice: 88, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Moringa_oleifera_pods.jpg/800px-Moringa_oleifera_pods.jpg' },
  { itemCode: 'IT0025', name: 'Banana Blossom', description: 'Kesel Muwa — the beautiful purple banana blossom flower. Used in curries.', category: 'Vegetable', unit: 'kg', stockQuantity: 40, purchasePrice: 80, retailPrice: 70, wholesalePrice: 65, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Banana_flower.jpg/800px-Banana_flower.jpg' },
  { itemCode: 'IT0026', name: 'Lime (Dehi)', description: 'Dehi — Sri Lankan lime. Essential for cooking, salads, and sambol.', category: 'Vegetable', unit: 'kg', stockQuantity: 70, purchasePrice: 300, retailPrice: 350, wholesalePrice: 325, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Lime_-_whole_and_halved.jpg/800px-Lime_-_whole_and_halved.jpg' },
  { itemCode: 'IT0027', name: 'Thibbatu', description: 'Thibbatu — small pea-sized eggplant (turkey berry). Used in traditional curries.', category: 'Vegetable', unit: 'kg', stockQuantity: 30, purchasePrice: 250, retailPrice: 300, wholesalePrice: 275, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Solanum_torvum_fruits.jpg/800px-Solanum_torvum_fruits.jpg' },
  { itemCode: 'IT0028', name: 'Pittu Kekiri', description: 'Pittu Kekiri — Sri Lankan yellow melon / sweet cucumber. Refreshing tropical fruit.', category: 'Fruit', unit: 'kg', stockQuantity: 50, purchasePrice: 100, retailPrice: 150, wholesalePrice: 130, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Dosakaya_or_Yellow_Cucumber.jpg/800px-Dosakaya_or_Yellow_Cucumber.jpg' },
  { itemCode: 'IT0029', name: 'Chili Green', description: 'Miris Kola — fresh green chilies, medium heat. A must for Sri Lankan cooking.', category: 'Vegetable', unit: 'kg', stockQuantity: 60, purchasePrice: 150, retailPrice: 160, wholesalePrice: 150, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Green_Chili_Peppers.jpg/800px-Green_Chili_Peppers.jpg' },
  { itemCode: 'IT0030', name: 'Tomato', description: 'Thakkali — fresh red tomatoes for curries, sambols, and salads.', category: 'Vegetable', unit: 'kg', stockQuantity: 80, purchasePrice: 180, retailPrice: 180, wholesalePrice: 165, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tomato_je.jpg/800px-Tomato_je.jpg' },
  { itemCode: 'IT0031', name: 'Nai Miris (Hot Chili)', description: 'Nai Miris — bird\'s eye chili. Extremely hot, used in pol sambol.', category: 'Vegetable', unit: 'kg', stockQuantity: 25, purchasePrice: 800, retailPrice: 900, wholesalePrice: 850, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Birdseye_chili.jpg/800px-Birdseye_chili.jpg' },
  { itemCode: 'IT0032', name: 'Pomegranate (Local)', description: 'Delum — locally grown Sri Lankan pomegranate. Rich in antioxidants.', category: 'Fruit', unit: 'kg', stockQuantity: 40, purchasePrice: 500, retailPrice: 700, wholesalePrice: 650, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Pomegranate_fruit_and_seeds.jpg/800px-Pomegranate_fruit_and_seeds.jpg' },
  { itemCode: 'IT0033', name: 'Papaw Taning', description: 'Gaslabu Taning — yellow-ripe papaya with juicy orange flesh.', category: 'Fruit', unit: 'kg', stockQuantity: 60, purchasePrice: 100, retailPrice: 150, wholesalePrice: 135, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Papaya_cross_section_BNC.jpg/800px-Papaya_cross_section_BNC.jpg' },
  { itemCode: 'IT0034', name: 'Papaw No.2', description: 'Gaslabu No.2 — Grade 2 ripe papaya, great for smoothies.', category: 'Fruit', unit: 'kg', stockQuantity: 60, purchasePrice: 80, retailPrice: 130, wholesalePrice: 115, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Papaya_cross_section_BNC.jpg/800px-Papaya_cross_section_BNC.jpg' },
  { itemCode: 'IT0035', name: 'KK Banana No.3', description: 'Kolikuttu No.3 — Grade 3 Kolikuttu banana, excellent for cooking.', category: 'Banana', unit: 'kg', stockQuantity: 90, purchasePrice: 100, retailPrice: 180, wholesalePrice: 160, image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80' },
  { itemCode: 'IT0036', name: 'Banana Sour No.3', description: 'Ambul Kesel No.3 — Grade 3 sour banana. Best for banana chips.', category: 'Banana', unit: 'kg', stockQuantity: 90, purchasePrice: 50, retailPrice: 100, wholesalePrice: 88, image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=600&q=80' },
];

const run = async () => {
  await connectDB();
  console.log('KBR Fresh Foods — Seeding Real Data...\n');

  // 1. Seed Suppliers
  console.log('━━━ Seeding Suppliers ━━━');
  let suppCount = 0;
  for (const s of SUPPLIERS) {
    await Supplier.findOneAndUpdate(
      { supplierId: s.supplierId },
      s,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    suppCount++;
    process.stdout.write(`\r  ✓ ${suppCount}/${SUPPLIERS.length} suppliers`);
  }
  console.log(`\n  ✅ ${suppCount} suppliers seeded!\n`);

  // 2. Seed Purchases
  console.log('━━━ Seeding Purchase Orders ━━━');
  let purCount = 0;
  for (const p of PURCHASES) {
    await Purchase.findOneAndUpdate(
      { purchaseCode: p.purchaseCode },
      { ...p, purchaseDate: new Date(p.purchaseDate) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    purCount++;
    process.stdout.write(`\r  ✓ ${purCount}/${PURCHASES.length} purchases`);
  }
  console.log(`\n  ✅ ${purCount} purchase orders seeded!\n`);

  // 3. Seed Products with accurate images
  console.log('━━━ Seeding Products ━━━');
  const categories = ['Fruit', 'Vegetable', 'Banana', 'OTHERS'];
  const catDocs = {};
  for (const catName of categories) {
    let cat = await Category.findOne({ name: { $regex: new RegExp('^' + catName + '$', 'i') } });
    if (!cat) {
      const type = catName.toLowerCase() === 'vegetable' ? 'vegetable' : 'fruit';
      cat = await Category.create({ name: catName, type });
    }
    catDocs[catName.toLowerCase()] = cat._id;
  }

  // Clear and re-seed products
  await Product.deleteMany({});
  let prodCount = 0;
  for (const p of PRODUCT_DATA) {
    const catId = catDocs[p.category.toLowerCase()] || catDocs['others'];
    await Product.create({
      itemCode: p.itemCode,
      name: p.name,
      description: p.description,
      category: catId,
      unit: p.unit,
      stockQuantity: p.stockQuantity,
      purchasePrice: p.purchasePrice,
      retailPrice: p.retailPrice,
      wholesalePrice: p.wholesalePrice,
      images: [p.image],
      isPerishable: !['IT0013', 'IT0014'].includes(p.itemCode),
      lowStockThreshold: 20,
      status: 'Active',
      isActive: true,
    });
    prodCount++;
    process.stdout.write(`\r  ✓ ${prodCount}/${PRODUCT_DATA.length} products`);
  }
  console.log(`\n  ✅ ${prodCount} products seeded!\n`);

  console.log('🎉 All done! KBR Fresh Foods database is fully seeded.\n');
  process.exit(0);
};

run().catch(console.error);
