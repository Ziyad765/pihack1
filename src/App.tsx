import React, { useState, useEffect } from 'react';

interface Product {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    basePrice: number;
    currentPrice: number;
    stock: number;
    demandScore: number;
}

interface User {
    id: number;
    username: string;
    loyaltyPoints: number;
}

const initialProducts: Product[] = [
    {
        id: 1,
        name: 'Laptop',
        description: 'High-performance laptop',
        imageUrl: 'https://placekitten.com/200/300',
        basePrice: 1200,
        currentPrice: 1200,
        stock: 50,
        demandScore: 1,
    },
    {
        id: 2,
        name: 'Smartphone',
        description: 'Latest smartphone model',
        imageUrl: 'https://placekitten.com/200/301',
        basePrice: 800,
        currentPrice: 800,
        stock: 100,
        demandScore: 1,
    },
    {
        id: 3,
        name: 'Tablet',
        description: 'Portable tablet device',
        imageUrl: 'https://placekitten.com/200/302',
        basePrice: 400,
        currentPrice: 400,
        stock: 75,
        demandScore: 1,
    },
];


const initialUsers: User[] = [
    {
        id: 1,
        username: 'testuser',
        loyaltyPoints: 0,
    }
]

const DynamicCommercePlatform: React.FC = () => {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [cart, setCart] = useState<{ productId: number; quantity: number }[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(initialUsers[0]);
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [loginUsername, setLoginUsername] = useState<string>('');
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!currentUser)

    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCart(JSON.parse(storedCart));
        }

        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
          setIsLoggedIn(true)
        }
       
    }, []);


    useEffect(() => {
       if(isLoggedIn && currentUser){
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
       }else{
        localStorage.removeItem('currentUser')
       }
        
    }, [isLoggedIn, currentUser]);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);


    const handleLogin = () => {
        const user = users.find(u => u.username === loginUsername);
        if (user) {
           setCurrentUser(user);
           setIsLoggedIn(true);
        } else {
           alert('User not found')
        }
      };
    
      const handleLogout = () => {
        setCurrentUser(null);
        setIsLoggedIn(false);
        setCart([]);
      };

    const updateProductPrice = (productId: number, newPrice: number) => {
        setProducts((prevProducts) =>
            prevProducts.map((product) =>
                product.id === productId ? { ...product, currentPrice: newPrice } : product
            )
        );
    };

    const updateProductStock = (productId: number, newStock: number) => {
        setProducts((prevProducts) =>
            prevProducts.map((product) =>
                product.id === productId ? { ...product, stock: newStock } : product
            )
        );
    };

    const adjustPrice = (productId: number) => {
        const product = products.find((p) => p.id === productId);
        if (!product) return;

        let newPrice = product.currentPrice;
        let demandAdjustment = 0;


        const quantityBought = cart.reduce((acc, item) => {
            if (item.productId === productId) {
                return acc + item.quantity;
            }
            return acc;
        }, 0);

            if (quantityBought > 5) {
                demandAdjustment = 1;
            }
      
            if (quantityBought > 10) {
                demandAdjustment = 3;
            }

        if (demandAdjustment > 0 ) {
          newPrice = product.basePrice + (product.basePrice * (demandAdjustment/10) )
        }

      
       if(product.stock < 20) {
            newPrice = product.basePrice - (product.basePrice * 0.05)
       }
       if(product.stock > 50){
         newPrice = product.basePrice
       }


        updateProductPrice(productId, newPrice);
    };

    const addToCart = (productId: number) => {
        const product = products.find((p) => p.id === productId);
        if (!product || product.stock <= 0) return;

        const existingCartItem = cart.find((item) => item.productId === productId);

        if (existingCartItem) {
            setCart((prevCart) =>
                prevCart.map((item) =>
                    item.productId === productId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            );
        } else {
            setCart((prevCart) => [...prevCart, { productId, quantity: 1 }]);
        }
        updateProductStock(productId, product.stock - 1)
    };


    const removeFromCart = (productId: number) => {
      const product = products.find((p) => p.id === productId);
        if(!product) return;

        const existingCartItem = cart.find((item) => item.productId === productId);
        if (!existingCartItem) return;

        if(existingCartItem.quantity > 1){
            setCart((prevCart) =>
            prevCart.map((item) =>
                item.productId === productId
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
        );
        }else{
              setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
        }

      updateProductStock(productId, product.stock + 1)


    };

    const calculateTotal = () => {
        let total = 0;
        cart.forEach((item) => {
            const product = products.find((p) => p.id === item.productId);
            if (product) {
                total += product.currentPrice * item.quantity;
            }
        });

        return total;
    };


    const calculateLoyaltyDiscount = () => {
      if(!currentUser) return 0;
      let loyaltyDiscount = 0;

      if(currentUser?.loyaltyPoints > 0){
         loyaltyDiscount = calculateTotal() * 0.05;
      }
      return loyaltyDiscount;
    }



    const checkout = () => {
         if(!currentUser) {
            alert('Login before checkout')
            return;
        }
        if(cart.length === 0) {
          alert("Your cart is empty")
           return;
        }
        let total = calculateTotal()
        const discount = calculateLoyaltyDiscount()
        total = total - discount
        alert(`Checkout completed for $${total.toFixed(2)}! You earned ${total*0.05} loyalty points`);
         const updatedUser = {...currentUser, loyaltyPoints: (currentUser?.loyaltyPoints || 0) + (total*0.05)}
         setCurrentUser(updatedUser);
         setUsers(prevUsers => prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user))
        setCart([]);
        products.forEach(p => adjustPrice(p.id))
    };


   
    const adminOverrideStock = (productId: number) => {
        const newStock = prompt("Enter the new stock for product id "+productId)
        if(newStock){
            updateProductStock(productId, parseInt(newStock))
             adjustPrice(productId);
        }
    }
    return (
        <div className="font-sans bg-gray-100 min-h-screen">
           <nav className="bg-blue-500 p-4 text-white flex justify-between items-center">
              <h1 className="text-xl font-bold">E-Commerce Platform</h1>
               <div className="flex items-center space-x-4">
                {isLoggedIn ? (
                      <>
                         <span>Welcome, {currentUser?.username} ({currentUser?.loyaltyPoints?.toFixed(2)} Loyalty Points)</span>
                         <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Logout</button>
                      </>
                     ) : (
                        <div className="flex space-x-4">
                          <input
                            type="text"
                            placeholder="Username"
                            value={loginUsername}
                            onChange={(e) => setLoginUsername(e.target.value)}
                            className="text-black p-2 rounded"
                           />
                           <button onClick={handleLogin} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">Login</button>
                        </div>
                       )}
                </div>
            </nav>
           
            <div className="container mx-auto py-8 flex">
               <div className="w-3/4 pr-4">
                 <h2 className="text-2xl font-semibold mb-4">Products</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {products.map((product) => (
                         <div key={product.id} className="bg-white p-4 rounded-lg shadow-md">
                           <img
                               src={product.imageUrl}
                               alt={product.name}
                               className="w-full h-48 object-cover rounded-md mb-2"
                             />
                             <h3 className="text-xl font-semibold mb-1">{product.name}</h3>
                            <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                             <p className="text-gray-800 font-bold mb-2">
                                Price: ${product.currentPrice.toFixed(2)}
                             </p>
                             <p className="text-gray-700 mb-2">
                               Stock: {product.stock}
                            </p>
                             <div className="flex justify-between">
                                <button
                                      onClick={() => addToCart(product.id)}
                                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                      disabled={product.stock === 0}
                                    >
                                     Add to Cart
                                </button>
                                <button
                                 onClick={() => removeFromCart(product.id)}
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                    disabled={cart.filter(item => item.productId === product.id).length === 0}
                                >Remove from Cart</button>
                             </div>

                            </div>
                         ))}
                    </div>
                </div>

              <div className="w-1/4 pl-4">
                    <h2 className="text-2xl font-semibold mb-4">Cart</h2>
                    {cart.length === 0 ? (
                        <p className="text-gray-600">Your cart is empty.</p>
                    ) : (
                        <ul className="mb-4">
                            {cart.map((item) => {
                                const product = products.find((p) => p.id === item.productId);
                                return (
                                    product && (
                                        <li key={item.productId} className="flex justify-between items-center py-2 border-b border-gray-200">
                                            <span>{product.name} x {item.quantity}</span>
                                            <span>${(product.currentPrice * item.quantity).toFixed(2)}</span>
                                        </li>
                                    )
                                );
                            })}
                        </ul>
                    )}

                    <div className="font-bold text-xl mb-2">
                         Total: ${calculateTotal().toFixed(2)}
                         </div>
                         <div className="font-bold text-xl mb-2">
                         Loyalty Discount: -${calculateLoyaltyDiscount().toFixed(2)}
                         </div>
                      <div className="font-bold text-xl mb-2">
                            Grand Total: ${(calculateTotal() - calculateLoyaltyDiscount()).toFixed(2)}
                        </div>
                   

                    <button
                     onClick={checkout}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4"
                    >
                        Checkout
                   </button>
                </div>
            </div>
           
            <div className="container mx-auto py-8">
             <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>
                  <table className="min-w-full bg-white border rounded-lg shadow-md">
                    <thead>
                     <tr>
                       <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                       <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                       <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Price</th>
                       <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                       <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                     <tbody>
                        {products.map(product => (
                           <tr key={product.id}>
                            <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">{product.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">{product.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">${product.basePrice.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">${product.currentPrice.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">{product.stock}</td>
                            <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                             <button onClick={() => adminOverrideStock(product.id)}
                                className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
                                >Override Stock</button>
                            </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                </div>
        </div>
    );
};

export default DynamicCommercePlatform;