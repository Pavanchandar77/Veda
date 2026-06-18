import cv2
import os
import sys

def extract_frames(video_path, output_dir, frame_interval=5, max_dim=1024):
    if not os.path.exists(video_path):
        print(f"Error: Video file '{video_path}' not found.")
        sys.exit(1)
        
    os.makedirs(output_dir, exist_ok=True)
    
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    print(f"Processing video: {video_path} ({total_frames} frames total)...")
    
    frame_count = 0
    saved_count = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        if frame_count % frame_interval == 0:
            h, w = frame.shape[:2]
            if max(h, w) > max_dim:
                scale = max_dim / float(max(h, w))
                new_w = int(w * scale)
                new_h = int(h * scale)
                frame = cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_AREA)
            
            out_path = os.path.join(output_dir, f"frame_{saved_count:04d}.jpg")
            cv2.imwrite(out_path, frame)
            saved_count += 1
            
        frame_count += 1
        
    cap.release()
    print(f"Extraction completed. Saved {saved_count} frames to '{output_dir}'.")

if __name__ == "__main__":
    # Check for CLI arguments: [script, video_path, output_dir]
    video = sys.argv[1] if len(sys.argv) > 1 else "video.mp4"
    out_dir = sys.argv[2] if len(sys.argv) > 2 else "input_images"
    extract_frames(video, out_dir)
