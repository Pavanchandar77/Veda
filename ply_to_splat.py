import struct
import numpy as np
import sys
import os

def parse_ply(ply_path):
    print(f"Reading PLY file: {ply_path}...")
    vertices = []
    colors = []
    
    with open(ply_path, 'rb') as f:
        header = []
        is_binary = False
        num_vertices = 0
        
        while True:
            line = f.readline().decode('utf-8', errors='ignore').strip()
            header.append(line)
            if line.startswith("format binary"):
                is_binary = True
            elif line.startswith("element vertex"):
                num_vertices = int(line.split()[-1])
            elif line == "end_header":
                break
        
        print(f"Found {num_vertices} vertices. Format: {'Binary' if is_binary else 'ASCII'}")
        
        if is_binary:
            has_normals = any("nx" in l for l in header)
            has_alpha = any("alpha" in l or "diffuse_alpha" in l for l in header)
            
            fmt = "<fff"
            byte_size = 12
            
            if has_normals:
                fmt += "fff"
                byte_size += 12
            fmt += "BBB"
            byte_size += 3
            if has_alpha:
                fmt += "B"
                byte_size += 1
                
            for _ in range(num_vertices):
                data = f.read(byte_size)
                if not data:
                    break
                unpacked = struct.unpack(fmt, data)
                vertices.append(unpacked[0:3])
                if has_normals:
                    colors.append(unpacked[6:9])
                else:
                    colors.append(unpacked[3:6])
        else:
            for line in f:
                parts = line.decode('utf-8').strip().split()
                if len(parts) >= 6:
                    x, y, z = map(float, parts[0:3])
                    r, g, b = map(int, parts[3:6])
                    vertices.append((x, y, z))
                    colors.append((r, g, b))
                    
    return np.array(vertices, dtype=np.float32), np.array(colors, dtype=np.uint8)

def convert_ply_to_splat(ply_path, splat_path, constant_scale=0.015):
    if not os.path.exists(ply_path):
        print(f"Error: PLY file '{ply_path}' does not exist.")
        return
        
    vertices, colors = parse_ply(ply_path)
    num_splats = len(vertices)
    print(f"Converting {num_splats} points to isotropic Gaussian splats...")
    
    scale = np.array([constant_scale, constant_scale, constant_scale], dtype=np.float32)
    rotation = np.array([1.0, 0.0, 0.0, 0.0], dtype=np.float32) # unit quaternion [q_w, q_x, q_y, q_z]
    opacity = 255
    
    with open(splat_path, 'wb') as f:
        for i in range(num_splats):
            pos = vertices[i]
            col = colors[i]
            
            data = struct.pack(
                "<ffffffBBBBffff",
                pos[0], pos[1], pos[2],      # Position x, y, z
                scale[0], scale[1], scale[2],  # Scale x, y, z
                col[0], col[1], col[2], opacity, # Color r, g, b, alpha
                rotation[0], rotation[1], rotation[2], rotation[3] # Rotation w, x, y, z
            )
            f.write(data)
            
    print(f"Successfully exported splat file to: {splat_path} ({os.path.getsize(splat_path) / (1024*1024):.2f} MB)")

if __name__ == "__main__":
    # Check for CLI arguments: [script, ply_path, splat_path]
    ply = sys.argv[1] if len(sys.argv) > 1 else "workspace/sparse_points.ply"
    splat = sys.argv[2] if len(sys.argv) > 2 else "workspace/output.splat"
    convert_ply_to_splat(ply, splat)
