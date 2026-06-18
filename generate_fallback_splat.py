import sys
import os
import struct
import numpy as np

def generate_helix_splat(splat_path):
    print(f"Generating fallback holographic helix splat to: {splat_path}...")
    count = 35000
    constant_scale = 0.012
    opacity = 255
    rotation = np.array([1.0, 0.0, 0.0, 0.0], dtype=np.float32)
    
    # Ensure directory exists
    dir_name = os.path.dirname(splat_path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)
    
    with open(splat_path, 'wb') as f:
        for i in range(count):
            pct = i / count
            
            # Double helix shape
            if pct < 0.75:
                is_strand_b = (i % 2 == 0)
                theta = (i / (count * 0.75)) * np.pi * 14
                height = -1.1 + (i / (count * 0.75)) * 2.3
                
                angle = theta + (np.pi if is_strand_b else 0)
                r = 0.55
                px = r * np.cos(angle)
                pz = r * np.sin(angle)
                
                color_hex = '#06b6d4' if is_strand_b else '#8b5cf6'
            else:
                step = np.random.randint(0, 60)
                theta = (step / 60) * np.pi * 14
                height = -1.1 + (step / 60) * 2.3
                
                t = np.random.rand()
                r = 0.55 * (2 * t - 1)
                px = r * np.cos(theta)
                pz = r * np.sin(theta)
                
                color_hex = '#ec4899'
                
            r_val = int(color_hex[1:3], 16)
            g_val = int(color_hex[3:5], 16)
            b_val = int(color_hex[5:7], 16)
            
            data = struct.pack(
                "<ffffffBBBBffff",
                px, height, pz,
                constant_scale, constant_scale, constant_scale,
                r_val, g_val, b_val, opacity,
                rotation[0], rotation[1], rotation[2], rotation[3]
            )
            f.write(data)
    print("Fallback splat generation completed successfully.")

if __name__ == "__main__":
    out_path = sys.argv[1] if len(sys.argv) > 1 else "workspace/output.splat"
    generate_helix_splat(out_path)
