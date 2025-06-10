import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Layers,
    Droplet,
    BarChart3,
    CreditCard,
    Users,
    Mail
} from 'lucide-react';
import imgP from '../../assets/img/img.png'

interface LayoutProps {
    children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeItem, setActiveItem] = useState<string>('finanzas');

    const sidebarItems = [
        { icon: Layers,  label: 'Layers',  id: 'layers', to: '/sections', color: 'green' },
        { icon: Droplet, label: 'Droplet', id: 'droplet', to: '/droplet', color: 'orange' },
        { icon: BarChart3, label: 'Analytics', id: 'analytics', to: '/analytics', color: 'blue' },
        { icon: CreditCard, label: 'Sales', id: 'sales', to: '/sales', color: 'purple' },
        { icon: Users, label: 'Audience', id: 'users', to: '/audience', color: 'pink' },
        { icon: Mail, label: 'Mail', id: 'mail', to: '/mail', color: 'yellow' }
    ];

    useEffect(() => {
        const currentPath = location.pathname;
        const currentItem = sidebarItems.find(item => item.to === currentPath);
        if (currentItem) {
            setActiveItem(currentItem.id);
        }
    }, [location.pathname]);

    const handleItemClick = (item: any) => {
        setActiveItem(item.id);
        navigate(item.to);
    };

    const getItemStyles = (item: any) => {
        if (activeItem === item.id) {
            const colorClasses = {
                green: 'text-green-600 border-l-4 border-green-300',
                orange: 'text-orange-600 border-l-4 border-orange-300',
                blue: 'text-blue-600 border-l-4 border-blue-300',
                purple: 'text-purple-600 border-l-4 border-purple-300',
                pink: 'text-pink-600 border-l-4 border-pink-300',
                yellow: 'text-yellow-600 border-l-4 border-yellow-300'
            };
            return colorClasses[item.color as keyof typeof colorClasses] + ' shadow-sm';
        }
        return 'text-gray-600  hover:text-white';
    };

    return (
        <div className="flex h-screen bg-[#1b1b1b] p-4">
            {/* Sidebar */}
            <div className="w-16 bg-[#2a2a2a] shadow-lg flex flex-col items-center py-4 space-y-6 rounded-2xl mr-4">
                {/* Menu Toggle */}
                <button className="p-2 text-gray-600 hover:text-green-600 transition-colors cursor-pointer">
                    <img src={imgP} className="rounded-xl  " alt="perfil"/>
                </button>

                {/* Sidebar Icons */}
                <div className="flex flex-col space-y-4">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className={`p-3 rounded-lg transition-all duration-200 cursor-pointer ${getItemStyles(item)}`}
                            title={item.label}
                        >
                            <item.icon size={20} />
                        </button>
                    ))}
                </div>
            </div>

            <main className="flex-grow suse-font  rounded-2xl shadow-sm">
                {children}
            </main>
        </div>
    );
};

export default Layout;