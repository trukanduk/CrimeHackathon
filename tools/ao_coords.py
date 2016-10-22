#!/usr/bin/env python3

import argparse
import re
import json

def parsePolygon(ss):
	data = []
	for item in map(lambda item: item.split(' '), ss.split(',')):
		if len(item) == 2:
			data.append([float(item[1]), float(item[0])])
	return data

UPPERDISTRICT_NAMES = {
	'Юго-Восточный': "ЮВАО",
	'Зеленоградский': "ЗелАО",
	'Юго-Западный': "ЮЗАО",
	'Новомосковский': "ТИНАО",
	'Северный': "САО",
	'Западный': "ЗАО",
	'Южный': "ЮАО",
	'Центральный': "ЦАО",
	'Восточный': "ВАО",
	'Северо-Западный': "СЗАО",
	'Северо-Восточный': "СВАО",
}

def main(args):
	result = {}
	for index, line in enumerate(args.inp):
		if (index == 0 and not args.noskipheader) or not line.strip():
			continue

		shapeEnd = line.find("\"", 2)
		shape = line[1:shapeEnd]
		rest = line[shapeEnd+2:]
		if shape[:7] == "POLYGON":
			data = parsePolygon(shape[10:-2])
		elif shape[:12] == "MULTIPOLYGON":
			data = []
			polyre = re.compile(r"\(\((?P<data>(?:\d+\.\d+ \d+\.\d+,)*\d+\.\d+ \d+\.\d+)\)\)")
			for polygon in polyre.finditer(shape[14:-1]):

				data.append(parsePolygon(polygon.group("data")))

		name_raw = rest.split(",")[0]
		if name_raw[:3] == name_raw[-3:] in {'"""', "'''",}:
			name_raw = name_raw[3:-3]

		if args.upperdistricts:
			name = UPPERDISTRICT_NAMES[name_raw]
		else:
			name = UPPERDISTRICT_NAMES.get(name_raw, name_raw)

		result[name] = data

	print("var {} = ".format(args.varname), file=args.outp, end="")
	json.dump(result, args.outp)

if __name__ == "__main__":
	parser = argparse.ArgumentParser("Tool for translating AO coords to json.")
	parser.add_argument("inp", type=argparse.FileType("r", encoding="utf8"), help="input file (*csv)")
	parser.add_argument("outp", type=argparse.FileType("w", encoding="utf8"), help="output file (*.json|*.js)")
	parser.add_argument("-varname", default="kDistrictCoords", help="Variable name")
	parser.add_argument("-noskipheader", action="store_true", default=False, help="Skip first line (headers)")
	parser.add_argument("-upperdistricts", action="store_true", default=False, help="Force translate names")
	args = parser.parse_args()

	main(args)
