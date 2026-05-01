import { Link } from "react-router-dom";
import { ArrowRight, MapPin, ShieldCheck } from "lucide-react";
import Card3D from "./Card3D";

export default function ProductCard({ product, index = 0 }) {
  return (
    <Card3D intensity={5}>
      <Link to={`/product/${product._id}`} className="block h-full">
        <div
          data-reveal
          data-delay={`${(index % 8) * 80}`}
          className="reveal relative rounded-[1.25rem] overflow-hidden group h-full flex flex-col bg-white transition-all duration-500 hover:-translate-y-1.5"
          style={{
            boxShadow: '0 4px 20px rgba(0,0,0,0.03), inset 0 0 0 1px rgba(0,0,0,0.05)',
          }}
        >
          {/* Subtle Hover Glow Underneath */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
            style={{ 
              background: 'radial-gradient(circle at 50% 0%, hsl(var(--primary) / 0.05), transparent 70%)' 
            }}
          />

          {/* Image Container with precise aspect ratio */}
          <div className="relative aspect-[4/3] overflow-hidden flex-shrink-0 z-10 bg-slate-50">
            {/* Image zoom effect */}
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            
            {/* Glassmorphic Gradient Overlay (bottom to top) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-60" />

            {/* Top Badges */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
              {product.category && (
                <span className="backdrop-blur-md bg-white/20 border border-white/30 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm">
                  {product.category.toUpperCase()}
                </span>
              )}
              {product.location?.coordinates && (
                <span className="backdrop-blur-md bg-black/30 border border-white/10 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-full flex items-center gap-1">
                  <MapPin size={10} /> Local
                </span>
              )}
            </div>

            {/* Deposit Badge on Image */}
            <div className="absolute bottom-3 left-3">
              <span className="backdrop-blur-md bg-black/40 text-white/90 text-xs font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-emerald-400" />
                ₹{product.deposit} deposit
              </span>
            </div>
          </div>

          {/* Card Info Section */}
          <div className="p-5 flex flex-col flex-1 relative z-10">
            <h2 className="text-lg font-bold mb-1.5 text-slate-900 line-clamp-1 group-hover:text-[hsl(var(--primary))] transition-colors duration-300">
              {product.name}
            </h2>
            
            {/* Price Line */}
            <div className="flex items-end gap-1 mb-3">
              <span 
                className="font-black text-2xl tracking-tight" 
                style={{ 
                  background: 'linear-gradient(135deg, hsl(var(--foreground)), hsl(var(--primary)))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ₹{product.price}
              </span>
              <span className="text-slate-500 text-sm font-medium mb-1">/ month</span>
            </div>

            {/* Divider */}
            <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
              {/* Extra details (like address if available) */}
              <div className="flex-1">
                {product.address ? (
                  <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1 line-clamp-1">
                    <MapPin size={11} /> {product.address}
                  </p>
                ) : (
                  <div className="w-12 h-1 rounded-full bg-slate-100 transition-all duration-300 group-hover:w-16 group-hover:bg-[hsl(var(--primary)/0.2)]" />
                )}
              </div>

              {/* Action Button */}
              <div 
                className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 transition-all duration-300 group-hover:bg-[hsl(var(--primary))] group-hover:text-white group-hover:shadow-md group-hover:shadow-[hsl(var(--primary)/0.3)] group-hover:-rotate-45"
              >
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </Card3D>
  );
}
