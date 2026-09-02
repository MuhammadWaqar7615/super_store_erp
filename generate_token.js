const jwt = require('jsonwebtoken');
const token = jwt.sign({ id: 'dummy', role: 'Cashier' }, 'cInt/OePDAgvwO3Ks43gi4XUwuL/xVi66pSkx7kz+fk=', { expiresIn: '1h' });
console.log(token);
