from __future__ import annotations

from io import BytesIO
from pathlib import Path
from typing import Iterable
import math
import random
import shutil
import urllib.request
import zipfile

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
ASSETS_SOURCE_ROOT = ROOT / "Assets" / "free-open"
DOWNLOAD_ROOT = ASSETS_SOURCE_ROOT / "downloads"
GENERATED_ROOT = ASSETS_SOURCE_ROOT / "generated"
RUNTIME_ROOT = ROOT / "src" / "assets"


def ensure_dirs(paths: Iterable[Path]) -> None:
    for path in paths:
        path.mkdir(parents=True, exist_ok=True)


def download(url: str, out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request) as response:
        out_path.write_bytes(response.read())


def save_webp(image: Image.Image, out_path: Path, quality: int = 92) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(out_path, format="WEBP", quality=quality, method=6)


def save_png(image: Image.Image, out_path: Path) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(out_path, format="PNG", optimize=True)


def resize_image(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    return image.resize(size, Image.Resampling.LANCZOS)


def load_rgb(path: Path) -> Image.Image:
    return Image.open(path).convert("RGB")


def load_rgba(path: Path) -> Image.Image:
    return Image.open(path).convert("RGBA")


def load_zip_image(zip_path: Path, suffix: str, mode: str = "RGB") -> Image.Image:
    suffix_l = suffix.lower()
    with zipfile.ZipFile(zip_path) as archive:
        candidate = next(
            (name for name in archive.namelist() if name.lower().endswith(suffix_l)),
            None,
        )
        if candidate is None:
            raise FileNotFoundError(f"{suffix} not found in {zip_path}")
        with archive.open(candidate) as file_handle:
            data = file_handle.read()
    with Image.open(BytesIO(data)) as image:
        return image.convert(mode).copy()


def make_noise(width: int, height: int, amount: int = 255) -> Image.Image:
    img = Image.new("L", (width, height))
    dst = img.load()
    for y in range(height):
        for x in range(width):
            dst[x, y] = random.randint(0, amount)
    return img


def tint(image: Image.Image, black: str, white: str) -> Image.Image:
    gray = ImageOps.grayscale(image)
    return ImageOps.colorize(gray, black=black, white=white).convert("RGB")


def make_confetti_atlas_from_stamps(
    width: int,
    height: int,
    stamps: list[Image.Image],
    count: int = 180,
) -> Image.Image:
    atlas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    for _ in range(count):
        stamp = random.choice(stamps)
        scale = random.uniform(0.2, 0.65)
        size = max(8, int(stamp.width * scale))
        tile = resize_image(stamp, (size, size))
        angle = random.uniform(0, 360)
        tile = tile.rotate(angle, expand=True, resample=Image.Resampling.BICUBIC)
        alpha = random.randint(96, 220)
        rgb = Image.new(
            "RGBA",
            tile.size,
            (
                random.randint(164, 255),
                random.randint(195, 255),
                255,
                alpha,
            ),
        )
        tile = ImageChops.multiply(tile, rgb)
        x = random.randint(-tile.width // 2, width - tile.width // 2)
        y = random.randint(-tile.height // 2, height - tile.height // 2)
        atlas.alpha_composite(tile, (x, y))
    return atlas.filter(ImageFilter.GaussianBlur(radius=0.5))


def make_light_streak(width: int, height: int, glow_sprite: Image.Image) -> Image.Image:
    streak = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(streak)
    center_y = height // 2
    for i in range(10, 0, -1):
        alpha = int((i / 10) ** 1.8 * 185)
        thickness = max(1, int((i / 10) * (height // 2)))
        draw.rectangle(
            (0, center_y - thickness, width, center_y + thickness),
            fill=(255, 255, 255, alpha),
        )

    glow = resize_image(glow_sprite, (height * 5, height * 5))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=8))
    for x in (int(width * 0.18), int(width * 0.52), int(width * 0.84)):
        streak.alpha_composite(glow, (x - glow.width // 2, center_y - glow.height // 2))
    return streak.filter(ImageFilter.GaussianBlur(radius=1.9))


def make_waveform_mask(width: int, height: int, noise_tex: Image.Image) -> Image.Image:
    img = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    for x in range(width):
        wave = (math.sin(x * 0.05) + math.sin(x * 0.11 + 1.4)) * 0.36
        y = int((height / 2) + wave * (height / 2.7))
        draw.line((x, max(0, y - 2), x, min(height, y + 2)), fill=(255, 255, 255, 220))
    noise_line = resize_image(noise_tex.convert("RGBA"), (width, height)).filter(
        ImageFilter.GaussianBlur(0.6)
    )
    return ImageChops.multiply(img, noise_line)


def make_haze_plate_from_source(
    source: Image.Image,
    size: tuple[int, int],
    tint_black: str,
    tint_white: str,
    blur_radius: float,
    alpha_scale: float,
) -> Image.Image:
    plate = resize_image(source.convert("RGBA"), size).filter(
        ImageFilter.GaussianBlur(blur_radius)
    )
    rgb = tint(plate.convert("RGB"), tint_black, tint_white).convert("RGBA")
    alpha = ImageOps.grayscale(plate).point(lambda p: int(min(255, p * alpha_scale)))
    rgb.putalpha(alpha)
    return rgb


def make_radial_burst(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    center = size // 2
    for degree in range(0, 360, 8):
        radians = math.radians(degree)
        inner = size * 0.14
        outer = size * (0.35 + random.random() * 0.28)
        x1 = center + math.cos(radians) * inner
        y1 = center + math.sin(radians) * inner
        x2 = center + math.cos(radians) * outer
        y2 = center + math.sin(radians) * outer
        alpha = random.randint(110, 230)
        draw.line((x1, y1, x2, y2), fill=(255, 255, 255, alpha), width=random.randint(1, 3))
    return img.filter(ImageFilter.GaussianBlur(radius=1.8))


def make_ceiling_emissive_strip(width: int, height: int) -> Image.Image:
    img = Image.new("RGB", (width, height), (8, 16, 28))
    draw = ImageDraw.Draw(img)
    band_top = int(height * 0.33)
    band_bottom = int(height * 0.67)
    for i in range(6):
        inset = i * 5
        alpha = int(220 - i * 35)
        draw.rectangle(
            (inset, band_top + inset // 2, width - inset, band_bottom - inset // 2),
            fill=(134, 205, 255, alpha),
        )
    return img.filter(ImageFilter.GaussianBlur(radius=4.5))


def make_portal_gradient(size: int) -> Image.Image:
    img = Image.new("RGB", (size, size), (6, 16, 30))
    center = size / 2
    px = img.load()
    for y in range(size):
        for x in range(size):
            dx = (x - center) / center
            dy = (y - center) / center
            distance = min(1.0, math.sqrt(dx * dx + dy * dy))
            glow = 1.0 - distance
            px[x, y] = (
                int(26 + glow * 158),
                int(74 + glow * 174),
                int(126 + glow * 128),
            )
    return img.filter(ImageFilter.GaussianBlur(radius=1.8))


def make_lut_strip(width: int, height: int) -> Image.Image:
    img = Image.new("RGB", (width, height))
    px = img.load()
    for y in range(height):
        v = y / max(1, height - 1)
        for x in range(width):
            u = x / max(1, width - 1)
            px[x, y] = (
                int(min(255, (u ** 0.9) * 255)),
                int(min(255, ((u * 0.8 + v * 0.2) ** 1.0) * 255)),
                int(min(255, ((u * 0.58 + (1 - v) * 0.42) ** 1.1) * 255)),
            )
    return img


def write_sources_md(source_file: Path, lines: list[str]) -> None:
    source_file.parent.mkdir(parents=True, exist_ok=True)
    source_file.write_text("\n".join(lines) + "\n", encoding="utf-8")


def copy_to_generated(rel_path: str) -> None:
    src = RUNTIME_ROOT / rel_path
    dst = GENERATED_ROOT / rel_path
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)


def main() -> None:
    random.seed(20260226)
    ensure_dirs([DOWNLOAD_ROOT, GENERATED_ROOT, RUNTIME_ROOT])

    downloads = {
        # ambientCG CC0 material packs
        "Concrete013_2K-JPG.zip": "https://ambientcg.com/get?file=Concrete013_2K-JPG.zip",
        "Concrete013_1K-JPG.zip": "https://ambientcg.com/get?file=Concrete013_1K-JPG.zip",
        "Concrete047A_2K-JPG.zip": "https://ambientcg.com/get?file=Concrete047A_2K-JPG.zip",
        "Concrete047A_1K-JPG.zip": "https://ambientcg.com/get?file=Concrete047A_1K-JPG.zip",
        # Three.js example textures (open examples repository)
        "disc.png": "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/sprites/disc.png",
        "spark1.png": "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/sprites/spark1.png",
        "snowflake1.png": "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/sprites/snowflake1.png",
        "ball.png": "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/sprites/ball.png",
        "blossom.png": "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/sprites/blossom.png",
        "lensflare0.png": "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/lensflare/lensflare0.png",
        "smoke1.png": "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/opengameart/smoke1.png",
        "caustic_free.jpg": "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/opengameart/Caustic_Free.jpg",
        "noise.png": "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/noise.png",
        "venice_sunset_1k.hdr": "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/equirectangular/venice_sunset_1k.hdr",
        "san_giuseppe_bridge_2k.hdr": "https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/equirectangular/san_giuseppe_bridge_2k.hdr",
    }

    for filename, url in downloads.items():
        download(url, DOWNLOAD_ROOT / filename)

    wall_2k_zip = DOWNLOAD_ROOT / "Concrete013_2K-JPG.zip"
    wall_1k_zip = DOWNLOAD_ROOT / "Concrete013_1K-JPG.zip"
    floor_2k_zip = DOWNLOAD_ROOT / "Concrete047A_2K-JPG.zip"
    floor_1k_zip = DOWNLOAD_ROOT / "Concrete047A_1K-JPG.zip"

    tunnel_dir = RUNTIME_ROOT / "textures" / "tunnel"
    save_webp(load_zip_image(wall_2k_zip, "_Color.jpg"), tunnel_dir / "wall_albedo.webp")
    save_webp(load_zip_image(wall_2k_zip, "_NormalGL.jpg"), tunnel_dir / "wall_normal.webp")
    save_webp(load_zip_image(wall_2k_zip, "_Roughness.jpg"), tunnel_dir / "wall_roughness.webp")
    save_webp(
        load_zip_image(wall_2k_zip, "_AmbientOcclusion.jpg"),
        tunnel_dir / "wall_ao.webp",
    )
    save_webp(load_zip_image(floor_2k_zip, "_Color.jpg"), tunnel_dir / "floor_albedo.webp")
    save_webp(load_zip_image(floor_2k_zip, "_NormalGL.jpg"), tunnel_dir / "floor_normal.webp")
    save_webp(load_zip_image(floor_2k_zip, "_Roughness.jpg"), tunnel_dir / "floor_roughness.webp")
    save_webp(
        load_zip_image(floor_2k_zip, "_AmbientOcclusion.jpg"),
        tunnel_dir / "floor_ao.webp",
    )

    save_webp(load_zip_image(wall_1k_zip, "_Color.jpg"), tunnel_dir / "wall_albedo_1k.webp")
    save_webp(load_zip_image(wall_1k_zip, "_NormalGL.jpg"), tunnel_dir / "wall_normal_1k.webp")
    save_webp(load_zip_image(wall_1k_zip, "_Roughness.jpg"), tunnel_dir / "wall_roughness_1k.webp")
    save_webp(load_zip_image(floor_1k_zip, "_Color.jpg"), tunnel_dir / "floor_albedo_1k.webp")
    save_webp(load_zip_image(floor_1k_zip, "_NormalGL.jpg"), tunnel_dir / "floor_normal_1k.webp")
    save_webp(load_zip_image(floor_1k_zip, "_Roughness.jpg"), tunnel_dir / "floor_roughness_1k.webp")

    lights_dir = RUNTIME_ROOT / "textures" / "lights"
    save_webp(make_ceiling_emissive_strip(1024, 256), lights_dir / "ceiling_emissive_strip.webp")
    save_webp(make_portal_gradient(1024), lights_dir / "portal_gradient.webp")

    wall_ao = load_rgb(tunnel_dir / "wall_ao.webp")
    caustic_tex = load_rgb(DOWNLOAD_ROOT / "caustic_free.jpg")
    grime = ImageChops.multiply(
        resize_image(wall_ao, (1024, 1024)),
        resize_image(caustic_tex, (1024, 1024)),
    ).filter(ImageFilter.GaussianBlur(radius=0.8))
    save_webp(grime, RUNTIME_ROOT / "textures" / "decals" / "grime_atlas.webp")

    disc = load_rgba(DOWNLOAD_ROOT / "disc.png")
    spark = load_rgba(DOWNLOAD_ROOT / "spark1.png")
    snow = load_rgba(DOWNLOAD_ROOT / "snowflake1.png")
    ball = load_rgba(DOWNLOAD_ROOT / "ball.png")
    blossom = load_rgba(DOWNLOAD_ROOT / "blossom.png")
    smoke = load_rgba(DOWNLOAD_ROOT / "smoke1.png")
    lensflare = load_rgba(DOWNLOAD_ROOT / "lensflare0.png")

    sprites_dir = RUNTIME_ROOT / "sprites"
    smoke_mix = Image.alpha_composite(
        resize_image(smoke, (512, 512)),
        resize_image(disc, (512, 512)),
    )
    sharp_mix = Image.alpha_composite(
        resize_image(snow, (512, 512)),
        resize_image(spark, (512, 512)),
    )
    save_png(resize_image(smoke_mix, (256, 256)), sprites_dir / "dust_soft.png")
    save_png(resize_image(sharp_mix, (256, 256)), sprites_dir / "dust_sharp.png")
    save_png(resize_image(lensflare, (512, 512)), sprites_dir / "glow_soft.png")
    save_png(make_light_streak(1024, 128, lensflare), sprites_dir / "light_streak.png")
    save_png(
        make_confetti_atlas_from_stamps(1024, 1024, [ball, blossom, spark, disc]),
        sprites_dir / "confetti_atlas.png",
    )

    noise_tex = load_rgba(DOWNLOAD_ROOT / "noise.png")
    transition_dir = RUNTIME_ROOT / "textures" / "transition"
    save_webp(
        make_waveform_mask(1024, 64, noise_tex).convert("RGB"),
        transition_dir / "waveform_mask.webp",
    )
    save_webp(make_radial_burst(1024).convert("RGB"), transition_dir / "radial_burst_mask.webp")

    save_webp(
        resize_image(noise_tex.convert("RGB"), (512, 512)),
        RUNTIME_ROOT / "textures" / "noise" / "noise_tile.webp",
    )

    atmosphere_dir = RUNTIME_ROOT / "textures" / "atmosphere"
    haze_a = make_haze_plate_from_source(
        smoke,
        (2048, 1024),
        tint_black="#10243b",
        tint_white="#b9dcff",
        blur_radius=9.0,
        alpha_scale=0.72,
    )
    haze_b = make_haze_plate_from_source(
        caustic_tex.convert("RGBA"),
        (2048, 1024),
        tint_black="#0f1e33",
        tint_white="#8cbde8",
        blur_radius=11.0,
        alpha_scale=0.6,
    )
    save_webp(haze_a.convert("RGB"), atmosphere_dir / "haze_a.webp")
    save_webp(haze_b.convert("RGB"), atmosphere_dir / "haze_b.webp")

    overlays_dir = RUNTIME_ROOT / "overlays"
    grain = resize_image(noise_tex.convert("RGB"), (1024, 1024))
    save_webp(grain, overlays_dir / "film_grain.webp")
    vignette = Image.new("RGBA", (2048, 2048), (0, 0, 0, 0))
    vdraw = ImageDraw.Draw(vignette)
    center = 1024
    for i in range(14):
        radius = int((i + 1) / 14 * center)
        alpha = int((i / 13) ** 2.1 * 215)
        vdraw.ellipse(
            (center - radius, center - radius, center + radius, center + radius),
            outline=(0, 0, 0, alpha),
            width=8,
        )
    vignette = vignette.filter(ImageFilter.GaussianBlur(radius=34))
    save_webp(vignette.convert("RGB"), overlays_dir / "vignette.webp")

    lens_dirt = ImageChops.multiply(
        resize_image(caustic_tex.convert("RGBA"), (1024, 1024)),
        resize_image(lensflare, (1024, 1024)),
    ).filter(ImageFilter.GaussianBlur(radius=5))
    save_webp(lens_dirt.convert("RGB"), overlays_dir / "lens_dirt.webp")

    scanline = Image.new("RGB", (1024, 1024), (0, 0, 0))
    sdraw = ImageDraw.Draw(scanline)
    for y in range(0, 1024, 3):
        value = 18 if y % 6 == 0 else 10
        sdraw.line((0, y, 1024, y), fill=(value, value, value))
    save_webp(scanline, overlays_dir / "scanline.webp")

    save_png(make_lut_strip(1024, 32), RUNTIME_ROOT / "luts" / "cool_cinematic.png")

    hdr_dir = RUNTIME_ROOT / "hdr"
    shutil.copy2(DOWNLOAD_ROOT / "san_giuseppe_bridge_2k.hdr", hdr_dir / "env_tunnel_2k.hdr")
    shutil.copy2(DOWNLOAD_ROOT / "venice_sunset_1k.hdr", hdr_dir / "env_stadium_night_2k.hdr")

    model_source = ROOT / "Assets" / "Meshy_AI_Tunnel_to_the_Field_0226040001_texture.glb"
    if model_source.exists():
        model_target = RUNTIME_ROOT / "models" / "tunnel.glb"
        model_target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(model_source, model_target)

    tracked_runtime_files = [
        "textures/tunnel/wall_albedo.webp",
        "textures/tunnel/wall_normal.webp",
        "textures/tunnel/wall_roughness.webp",
        "textures/tunnel/wall_ao.webp",
        "textures/tunnel/floor_albedo.webp",
        "textures/tunnel/floor_normal.webp",
        "textures/tunnel/floor_roughness.webp",
        "textures/tunnel/floor_ao.webp",
        "textures/tunnel/wall_albedo_1k.webp",
        "textures/tunnel/wall_normal_1k.webp",
        "textures/tunnel/wall_roughness_1k.webp",
        "textures/tunnel/floor_albedo_1k.webp",
        "textures/tunnel/floor_normal_1k.webp",
        "textures/tunnel/floor_roughness_1k.webp",
        "textures/lights/ceiling_emissive_strip.webp",
        "textures/lights/portal_gradient.webp",
        "textures/decals/grime_atlas.webp",
        "textures/transition/waveform_mask.webp",
        "textures/transition/radial_burst_mask.webp",
        "textures/noise/noise_tile.webp",
        "textures/atmosphere/haze_a.webp",
        "textures/atmosphere/haze_b.webp",
        "sprites/dust_soft.png",
        "sprites/dust_sharp.png",
        "sprites/glow_soft.png",
        "sprites/light_streak.png",
        "sprites/confetti_atlas.png",
        "overlays/film_grain.webp",
        "overlays/vignette.webp",
        "overlays/lens_dirt.webp",
        "overlays/scanline.webp",
        "luts/cool_cinematic.png",
        "hdr/env_tunnel_2k.hdr",
        "hdr/env_stadium_night_2k.hdr",
    ]

    for rel_path in tracked_runtime_files:
        copy_to_generated(rel_path)

    if (RUNTIME_ROOT / "models" / "tunnel.glb").exists():
        copy_to_generated("models/tunnel.glb")

    write_sources_md(
        ASSETS_SOURCE_ROOT / "SOURCES.md",
        [
            "# Free/Open Hero-Transition Asset Sources",
            "",
            "AmbientCG (CC0) material packs used:",
            "- Concrete013",
            "- Concrete047A",
            "- Accessed via https://ambientcg.com/get",
            "",
            "Three.js examples texture repository used for sprites/overlays/HDR references:",
            "- https://github.com/mrdoob/three.js/tree/dev/examples/textures",
            "",
            "Derived assets produced locally by:",
            "- scripts/fetch-free-polish-assets.py",
            "",
            "Notes:",
            "- Runtime files are written to src/assets/.",
            "- Source copies are stored in Assets/free-open/downloads and Assets/free-open/generated.",
        ],
    )

    print("Curated free/open hero-transition assets downloaded and generated.")


if __name__ == "__main__":
    main()
