triangleFaceIndexDigits = ((0, 1, 4), (0, 1, 11), (0, 2, 3), (0, 2, 4), (0, 3, 10), (0, 5, 6), (0, 5, 8), (0, 6, 7), (0, 7, 9), (0, 8, 11), (0, 9, 10), (1, 2, 9), (1, 2, 10), (1, 3, 5), (1, 3, 6), (1, 4, 5), (2, 3, 5), (2, 4, 8), (2, 5, 7), (1, 6, 9), (1, 7, 8), (1, 7, 11), (1, 8, 10), (2, 6, 8), (2, 6, 11), (2, 7, 10), (2, 9, 11), (3, 4, 7), (3, 4, 11), (3, 6, 8), (3, 7, 10), (3, 8, 9), (3, 9, 11), (4, 5, 9), (4, 6, 7), (4, 6, 10), (4, 8, 11), (4, 9, 10), (5, 6, 9), (5, 7, 11), (5, 8, 10), (5, 10, 11), (6, 10, 11), (7, 8, 9));
triangleFaceIndexDigits = [set(indices) for indices in triangleFaceIndexDigits]

symmetryGenerator1ButOneIndexed = ((7,12,11),(10,9,8),(3,6,5),(1,4,2))
symmetryGenerator1 = tuple([tuple([n-1 for n in orbit]) for orbit in symmetryGenerator1ButOneIndexed])
# = ((6, 11, 10), (9, 8, 7), (2, 5, 4), (0, 3, 1))


symmetryGenerator1Map = {
0:3, 3:1, 1:0, 
2:5,5:4,4:2,
9:8,8:7,7:9,
6:11,11:10,10:6}

for dualplanes in triangleFaceIndexDigits:
    newpair = set([symmetryGenerator1Map[index] for index in dualplanes])
    if newpair not in triangleFaceIndexDigits:
        raise ValueError("Symmetry generator 1 takes {} to {}, which isn't a vertex!".format(dualplanes, newpair))

symmetryGenerator2Map = {
6:9,9:6,
11:7,7:11,
10:8,8:10,
2:0,0:2,
5:1,1:5,
4:3,3:4
}

for dualplanes in triangleFaceIndexDigits:
    newpair = set([symmetryGenerator2Map[index] for index in dualplanes])
    if newpair not in triangleFaceIndexDigits:
        raise ValueError("Symmetry generator 2 takes {} to {}, which isn't a vertex!".format(dualplanes, newpair))

# group investigation

def printInPermutationForm(label, groupelement, end='\n'):
    if all([groupelement[index] == index for index in groupelement]):
        print(label,"= I", end='')
    else:
        print(label, end=' ')
        # turn 0:1, 1:0 into (0, 1)
        labels = list(groupelement.keys())
        labels.sort()
        
        while len(labels) > 0:
            permutation = []
            nextelem = labels[0]
            while(nextelem not in permutation):
                permutation.append(nextelem)
                nextelem = groupelement[nextelem]
                labels.remove(nextelem)

            print(tuple(permutation), end='')
    print('',end=end)

def compose(el1,el2):
    # assuming el1 and el2 are dicts {0:some other thing}
    # return el1(el2(x))
    return {index: el1[el2[index]] for index in el1}

R = symmetryGenerator1Map
B = symmetryGenerator2Map
printInPermutationForm("R", R)
printInPermutationForm("B", B)
print('--')

printInPermutationForm("R^2", compose(symmetryGenerator1Map, symmetryGenerator1Map))
printInPermutationForm("R^3", compose(compose(symmetryGenerator1Map, symmetryGenerator1Map), symmetryGenerator1Map))

printInPermutationForm("B^2", compose(symmetryGenerator2Map, symmetryGenerator2Map))
print(compose(symmetryGenerator2Map, symmetryGenerator2Map) == compose(compose(symmetryGenerator1Map, symmetryGenerator1Map), symmetryGenerator1Map))

RB = compose(symmetryGenerator1Map, symmetryGenerator2Map)

RBPower = RB
for i in range(1,3):
    printInPermutationForm("(RB)^{}".format(i), RBPower)
    RBPower = compose(RBPower, RB)

print('--')

BR = compose(symmetryGenerator2Map, symmetryGenerator1Map)
printInPermutationForm("BR", BR)

BRPower = BR
for i in range(1,3):
    printInPermutationForm("(BR)^{}".format(i), BRPower)
    BRPower = compose(BRPower, BR)

RB != BR

printInPermutationForm("RBR", compose(RB, R))
printInPermutationForm("BRB", compose(BR, B))

print("--- investigation")
labeledGroupElements = [("R",R),("B",B),("I",compose(B,B))]
newlyDiscoveredLabeledElements = []
for i in range(3):
    for label1, element1 in labeledGroupElements:
        for label2, element2 in labeledGroupElements:
            newLabel = label1 + label2
            newElement = compose(element1, element2)

            alreadyFound = False
            for label, elem in labeledGroupElements:
                if elem == newElement:
                    alreadyFound = True
                    print(newLabel, "already known, equal to", label)

            for label, elem in newlyDiscoveredLabeledElements:
                if elem == newElement:
                    alreadyFound = True
                

            if not alreadyFound:
                newlyDiscoveredLabeledElements.append((newLabel, newElement))

    for label, elem in newlyDiscoveredLabeledElements:   
        printInPermutationForm("Discovered {}".format(label), elem) 
        labeledGroupElements.append((label, elem))

    newlyDiscoveredLabeledElements = []
    print([label for label, elem in labeledGroupElements])
    print("end of round",i)

