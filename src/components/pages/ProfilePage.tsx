import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMember } from '@/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Heart, ShoppingBag, LogOut, Edit2, Save, X } from 'lucide-react';
import { Image } from '@/components/ui/image';

export default function ProfilePage() {
  const { member, actions } = useMember();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: member?.contact?.firstName || '',
    lastName: member?.contact?.lastName || '',
    email: member?.loginEmail || '',
    phone: member?.contact?.phones?.[0] || '',
    nickname: member?.profile?.nickname || '',
  });

  const handleEditChange = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    // Here you would typically save the profile data
    console.log('Saving profile:', editData);
    setIsEditing(false);
  };

  const recentOrders = [
    {
      id: 'ORD-001',
      date: '2024-10-25',
      total: 9700,
      status: 'Delivered',
      items: 2,
    },
    {
      id: 'ORD-002',
      date: '2024-10-20',
      total: 5200,
      status: 'Delivered',
      items: 1,
    },
    {
      id: 'ORD-003',
      date: '2024-10-15',
      total: 4500,
      status: 'In Transit',
      items: 1,
    },
  ];

  const wishlistItems = [
    {
      id: '1',
      title: 'Golden Silk Kalamkari Saree',
      price: 6500,
      image: 'https://static.wixstatic.com/media/07221c_67c22c1851d8410f9ea099841ce35b1a~mv2.png?originWidth=384&originHeight=512',
    },
    {
      id: '2',
      title: 'Emerald Green Heritage Saree',
      price: 5800,
      image: 'https://static.wixstatic.com/media/07221c_67c22c1851d8410f9ea099841ce35b1a~mv2.png?originWidth=384&originHeight=512',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const },
    },
  } as const;

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Page Header */}
      <section className="bg-white border-b border-gray-200 py-8 md:py-12">
        <div className="max-w-[100rem] mx-auto px-4 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-2">
              My Account
            </h1>
            <p className="text-lg text-foreground/70 font-paragraph">
              Manage your profile and view your orders
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[100rem] mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Card Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 sticky top-24">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  {member?.profile?.photo?.url ? (
                    <Image src={member.profile.photo.url} alt={member?.profile?.nickname || 'Profile'} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-primary" />
                  )}
                </div>
                <h2 className="text-2xl font-heading font-bold text-foreground mb-1">
                  {member?.profile?.nickname || member?.contact?.firstName || 'User'}
                </h2>
                <p className="text-sm text-foreground/70 font-paragraph">
                  {member?.loginEmail}
                </p>
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3 text-foreground/70">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="font-paragraph text-sm">
                    {recentOrders.length} Orders
                  </span>
                </div>
                <div className="flex items-center gap-3 text-foreground/70">
                  <Heart className="w-5 h-5" />
                  <span className="font-paragraph text-sm">
                    {wishlistItems.length} Wishlist Items
                  </span>
                </div>
              </div>

              <Button
                onClick={actions.logout}
                variant="outline"
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="profile" className="font-paragraph">
                  Profile
                </TabsTrigger>
                <TabsTrigger value="orders" className="font-paragraph">
                  Orders
                </TabsTrigger>
                <TabsTrigger value="wishlist" className="font-paragraph">
                  Wishlist
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-white rounded-lg p-8 shadow-sm border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-heading font-bold text-foreground">
                      Personal Information
                    </h2>
                    {!isEditing && (
                      <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        className="border-primary/50 hover:bg-primary/5"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>

                  {isEditing ? (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div variants={itemVariants}>
                          <Label htmlFor="firstName" className="text-sm font-semibold text-foreground mb-2 block">
                            First Name
                          </Label>
                          <Input
                            id="firstName"
                            value={editData.firstName}
                            onChange={(e) => handleEditChange('firstName', e.target.value)}
                            className="w-full"
                          />
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <Label htmlFor="lastName" className="text-sm font-semibold text-foreground mb-2 block">
                            Last Name
                          </Label>
                          <Input
                            id="lastName"
                            value={editData.lastName}
                            onChange={(e) => handleEditChange('lastName', e.target.value)}
                            className="w-full"
                          />
                        </motion.div>
                      </div>

                      <motion.div variants={itemVariants}>
                        <Label htmlFor="email" className="text-sm font-semibold text-foreground mb-2 block">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={editData.email}
                          onChange={(e) => handleEditChange('email', e.target.value)}
                          className="w-full"
                          disabled
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <Label htmlFor="phone" className="text-sm font-semibold text-foreground mb-2 block">
                          Phone Number
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={editData.phone}
                          onChange={(e) => handleEditChange('phone', e.target.value)}
                          className="w-full"
                        />
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <Label htmlFor="nickname" className="text-sm font-semibold text-foreground mb-2 block">
                          Display Name
                        </Label>
                        <Input
                          id="nickname"
                          value={editData.nickname}
                          onChange={(e) => handleEditChange('nickname', e.target.value)}
                          className="w-full"
                        />
                      </motion.div>

                      <motion.div variants={itemVariants} className="flex gap-4 pt-4">
                        <Button
                          onClick={handleSaveProfile}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-sm"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button
                          onClick={() => setIsEditing(false)}
                          variant="outline"
                          className="border-primary/50 hover:bg-primary/5"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="space-y-6"
                    >
                      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm text-foreground/70 font-paragraph mb-1">First Name</p>
                          <p className="text-lg font-semibold text-foreground">
                            {member?.contact?.firstName || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-foreground/70 font-paragraph mb-1">Last Name</p>
                          <p className="text-lg font-semibold text-foreground">
                            {member?.contact?.lastName || 'Not provided'}
                          </p>
                        </div>
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <p className="text-sm text-foreground/70 font-paragraph mb-1">Email Address</p>
                        <p className="text-lg font-semibold text-foreground">
                          {member?.loginEmail}
                        </p>
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <p className="text-sm text-foreground/70 font-paragraph mb-1">Phone Number</p>
                        <p className="text-lg font-semibold text-foreground">
                          {member?.contact?.phones?.[0] || 'Not provided'}
                        </p>
                      </motion.div>

                      <motion.div variants={itemVariants}>
                        <p className="text-sm text-foreground/70 font-paragraph mb-1">Member Since</p>
                        <p className="text-lg font-semibold text-foreground">
                          {member?._createdDate
                            ? new Date(member._createdDate).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : 'Recently joined'}
                        </p>
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="space-y-6">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                    Order History
                  </h2>

                  <div className="space-y-4">
                    {recentOrders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        variants={itemVariants}
                        className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                          <div>
                            <p className="text-sm text-foreground/70 font-paragraph mb-1">Order ID</p>
                            <p className="text-lg font-heading font-bold text-foreground">
                              {order.id}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-foreground/70 font-paragraph mb-1">Date</p>
                            <p className="text-lg font-semibold text-foreground">
                              {new Date(order.date).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-foreground/70 font-paragraph mb-1">Status</p>
                            <span
                              className={`inline-block px-3 py-1 rounded-sm text-sm font-semibold ${
                                order.status === 'Delivered'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-foreground/70 font-paragraph mb-1">Total</p>
                            <p className="text-2xl font-bold text-primary">
                              ₹{order.total.toLocaleString('en-IN')}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </TabsContent>

              {/* Wishlist Tab */}
              <TabsContent value="wishlist" className="space-y-6">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                    My Wishlist
                  </h2>

                  {wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {wishlistItems.map((item, index) => (
                        <motion.div
                          key={item.id}
                          variants={itemVariants}
                          className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
                        >
                          <div className="relative overflow-hidden h-64 bg-gray-100">
                            <Image src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          </div>
                          <div className="p-6">
                            <h3 className="text-lg font-heading font-bold text-foreground mb-2 line-clamp-2">
                              {item.title}
                            </h3>
                            <p className="text-2xl font-bold text-primary mb-4">
                              ₹{item.price.toLocaleString('en-IN')}
                            </p>
                            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-sm">
                              Add to Cart
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="w-12 h-12 text-foreground/30 mx-auto mb-4" />
                      <p className="text-lg text-foreground/70 font-paragraph">
                        Your wishlist is empty
                      </p>
                    </div>
                  )}
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
